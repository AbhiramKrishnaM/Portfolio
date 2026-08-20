<template>
  <canvas ref="canvasRef" class="grid-canvas" />
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import {
  Color,
  DynamicDrawUsage,
  Fog,
  Group,
  InstancedMesh,
  Matrix4,
  PerspectiveCamera,
  PlaneGeometry,
  Plane as ThreePlane,
  Raycaster,
  Scene,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { useTheme } from "@/composables/useTheme.js";

const { theme } = useTheme();

const canvasRef = ref(null);
let renderer, scene, camera, group, mesh, raycaster, animFrameId, gridUniforms;

// Dark = dim indigo tiles that flare mint near the cursor. Light = pale
// slate tiles that deepen toward the brand indigo — same "energizes near
// the cursor" idea, inverted for a light backdrop. `fog` matches the page
// background (--color-theme-main) so distant tiles dissolve into it instead
// of the grid visibly stopping partway up the screen. `fresnel` is the
// glossy-floor glint color that rims tiles viewed at a grazing angle.
const THEME_COLORS = {
  dark: { base: 0x0c1f33, hover: 0x43d9ad, fog: 0x011627, fresnel: 0xbfe9ff },
  light: { base: 0xc7d4de, hover: 0x4049b0, fog: 0xeff4f8, fresnel: 0xd7e6f5 },
};

const baseColor = new Color();
const hoverColor = new Color();
const tmpColor = new Color();

function applyThemeColors() {
  const c = THEME_COLORS[theme.value] ?? THEME_COLORS.dark;
  baseColor.set(c.base);
  hoverColor.set(c.hover);
  if (scene?.fog) scene.fog.color.set(c.fog);
  if (gridUniforms) gridUniforms.uFresnelColor.value.set(c.fresnel);
}

watch(theme, applyThemeColors);

// ── Grid layout ─────────────────────────────────────────────────────────
// Small tiles with a visible gap between them, laid out on the group's local
// XY plane; the group itself is tilted so the plane reads as a floor the
// page's content rests on, receding away from the camera.
const COLS = 64;
const ROWS = 60;
const CELL = 0.34;
const FILL = 0.72; // fraction of each cell the visible tile occupies (rest = gap)
const LIFT_RADIUS = 1.6;
const MAX_LIFT = 0.42;
const LIFT_EASE = 0.12; // per-frame damping toward the target lift

// Ambient sea-swell: several sine fields, each with a randomized direction,
// frequency, speed and phase (picked once, at load). Because their speeds and
// frequencies are incommensurate, the sum never falls into a visible repeat —
// it reads as genuinely irregular chop rather than one clean uniform ripple.
const WAVE_AMPLITUDE = 0.09;
const WAVE_OCTAVES = 6;
const waveField = Array.from({ length: WAVE_OCTAVES }, () => {
  const angle = Math.random() * Math.PI * 2;
  return {
    dx: Math.cos(angle),
    dy: Math.sin(angle),
    freq: 0.18 + Math.random() * 0.55,
    speed: 0.12 + Math.random() * 0.45,
    phase: Math.random() * Math.PI * 2,
    weight: 0.5 + Math.random() * 0.5,
  };
});
const waveWeightSum = waveField.reduce((sum, w) => sum + w.weight, 0);

function waveHeight(x, y, t) {
  let h = 0;
  for (const w of waveField) {
    h += Math.sin((x * w.dx + y * w.dy) * w.freq + t * w.speed + w.phase) * w.weight;
  }
  return (h / waveWeightSum) * WAVE_AMPLITUDE;
}

// Energy waves: expanding rings spawned by a click, each pushing tiles up and
// flaring their color as the ring front passes through, then dying out.
const MAX_WAVES = 6;
const WAVE_RING_SPEED = 2.4;   // world units/sec the ring front expands
const WAVE_RING_WIDTH = 0.55;  // ring thickness
const WAVE_RING_HEIGHT = 0.55; // extra lift at the ring front
const WAVE_RING_LIFETIME = 2.4; // seconds until a ring is fully spent
let activeWaves = []; // { x, y, start } in local grid space / seconds since t0
let currentT = 0;

function spawnEnergyWave(x, y) {
  if (activeWaves.length >= MAX_WAVES) activeWaves.shift();
  activeWaves.push({ x, y, start: currentT });
}

let cellCenters = null; // Float32Array[COLS*ROWS*2] local (x, y) per instance
let lift = null;        // Float32Array[COLS*ROWS] current eased lift per instance
const _matrix = new Matrix4();
const _mousePoint = new Vector3();
const _planeNormal = new Vector3();
const groundPlane = new ThreePlane();

// Smoothed mouse in NDC [-1, 1]; null while the pointer hasn't moved onto the page.
let tmx = null, tmy = null;

// ── Shaders ─────────────────────────────────────────────────────────────
// instanceMatrix/instanceColor are declared by Three automatically for any
// material rendering an InstancedMesh with instance colors — no need (and no
// room, it'd be a redeclaration error) to declare them ourselves here.
const gridVert = `
  varying vec3 vColor;
  varying vec3 vWorldPos;
  varying vec3 vNormalW;

  #include <fog_pars_vertex>

  void main() {
    vColor = instanceColor;
    vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    vNormalW = normalize(mat3(modelMatrix) * vec3(0.0, 0.0, 1.0));

    vec4 mvPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;

    #include <fog_vertex>
  }
`;

const gridFrag = `
  uniform vec3 uFresnelColor;
  uniform float uOpacity;
  varying vec3 vColor;
  varying vec3 vWorldPos;
  varying vec3 vNormalW;

  #include <fog_pars_fragment>

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = pow(1.0 - max(dot(normalize(vNormalW), viewDir), 0.0), 2.2);
    vec3 col = vColor + uFresnelColor * fresnel * 0.6;
    gl_FragColor = vec4(col, uOpacity);

    #include <fog_fragment>
  }
`;

function buildGrid() {
  const geometry = new PlaneGeometry(CELL * FILL, CELL * FILL);
  gridUniforms = {
    ...UniformsUtils.clone(UniformsLib.fog), // fogColor/fogNear/fogFar — refreshFogUniforms writes into these
    uFresnelColor: { value: new Color(0xbfe9ff) },
    uOpacity: { value: 0.55 },
  };
  const material = new ShaderMaterial({
    vertexShader: gridVert,
    fragmentShader: gridFrag,
    uniforms: gridUniforms,
    transparent: true,
    depthWrite: false,
    fog: true,
  });

  const count = COLS * ROWS;
  mesh = new InstancedMesh(geometry, material, count);
  mesh.instanceMatrix.setUsage(DynamicDrawUsage);
  mesh.instanceColor = null;

  cellCenters = new Float32Array(count * 2);
  lift = new Float32Array(count);

  const w = COLS * CELL;
  const h = ROWS * CELL;
  let i = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL - w / 2 + CELL / 2;
      const y = row * CELL - h / 2 + CELL / 2;
      cellCenters[i * 2] = x;
      cellCenters[i * 2 + 1] = y;

      _matrix.makeTranslation(x, y, 0);
      mesh.setMatrixAt(i, _matrix);
      mesh.setColorAt(i, baseColor);
      i++;
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor.needsUpdate = true;

  group.add(mesh);
}

function applyResponsiveLayout(w) {
  const mobile = w < 1024;
  group.position.set(0, mobile ? -1.6 : -1.3, mobile ? -1.6 : -1.2);
  group.scale.setScalar(mobile ? 0.85 : 1.0);
}

function init() {
  const canvas = canvasRef.value;
  const w = window.innerWidth;
  const h = window.innerHeight;

  renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene = new Scene();
  scene.fog = new Fog(0x011627, 5, 12);
  camera = new PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.set(0, 1.3, 6);
  camera.lookAt(0, -1.0, -3);

  raycaster = new Raycaster();

  group = new Group();
  group.rotation.x = -Math.PI * 0.42;
  scene.add(group);

  applyThemeColors(); // sets baseColor/hoverColor before buildGrid() uses them
  buildGrid();
  applyThemeColors(); // now gridUniforms exists too — sets the fresnel color
  applyResponsiveLayout(w);
}

function onMouseMove(e) {
  tmx = (e.clientX / window.innerWidth) * 2 - 1;
  tmy = -((e.clientY / window.innerHeight) * 2 - 1);
}

function onMouseLeave() {
  tmx = null;
  tmy = null;
}

function updateGroundPlane() {
  _planeNormal.set(0, 0, 1).applyQuaternion(group.quaternion);
  groundPlane.setFromNormalAndCoplanarPoint(_planeNormal, group.position);
}

function onPointerDown(e) {
  const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
  const ndcY = -((e.clientY / window.innerHeight) * 2 - 1);
  raycaster.setFromCamera(new Vector2(ndcX, ndcY), camera);
  updateGroundPlane();
  if (raycaster.ray.intersectPlane(groundPlane, _mousePoint)) {
    const p = _mousePoint.clone();
    group.worldToLocal(p);
    spawnEnergyWave(p.x, p.y);
  }
}

function startLoop() {
  const t0 = performance.now();

  function tick() {
    animFrameId = requestAnimationFrame(tick);
    const t = (performance.now() - t0) / 1000;
    currentT = t;

    // Gentle ambient sway — a "space-time fabric" breathing, not a static grid.
    group.rotation.z = Math.sin(t * 0.12) * 0.03;

    updateGroundPlane();

    let localX = null, localY = null;
    if (tmx !== null) {
      raycaster.setFromCamera(new Vector2(tmx, tmy), camera);
      if (raycaster.ray.intersectPlane(groundPlane, _mousePoint)) {
        group.worldToLocal(_mousePoint);
        localX = _mousePoint.x;
        localY = _mousePoint.y;
      }
    }

    if (activeWaves.length) {
      activeWaves = activeWaves.filter((w) => t - w.start < WAVE_RING_LIFETIME);
    }

    const count = COLS * ROWS;
    for (let i = 0; i < count; i++) {
      const cx = cellCenters[i * 2];
      const cy = cellCenters[i * 2 + 1];

      let target = 0;
      if (localX !== null) {
        const dx = cx - localX;
        const dy = cy - localY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        target = dist < LIFT_RADIUS ? 1 - dist / LIFT_RADIUS : 0;
        target = target * target; // ease-out falloff, sharper near the cursor
      }

      lift[i] += (target - lift[i]) * LIFT_EASE;
      const l = lift[i];
      const wave = waveHeight(cx, cy, t);

      // Energy-wave rings: an expanding front that lifts and flares tiles as
      // it sweeps past them, then fades — sum in case a few overlap.
      let ring = 0;
      for (let w = 0; w < activeWaves.length; w++) {
        const rw = activeWaves[w];
        const age = t - rw.start;
        const dxw = cx - rw.x;
        const dyw = cy - rw.y;
        const dist = Math.sqrt(dxw * dxw + dyw * dyw);
        const radius = age * WAVE_RING_SPEED;
        const distToRing = Math.abs(dist - radius);
        const front = Math.max(0, 1 - distToRing / WAVE_RING_WIDTH);
        const decay = Math.max(0, 1 - age / WAVE_RING_LIFETIME);
        ring += front * front * decay;
      }

      _matrix.makeTranslation(cx, cy, wave + l * MAX_LIFT + ring * WAVE_RING_HEIGHT);
      mesh.setMatrixAt(i, _matrix);

      tmpColor.copy(baseColor).lerp(hoverColor, l);
      tmpColor.multiplyScalar(1 + wave * 0.9); // crests glint, troughs dim
      tmpColor.r = Math.min(1, tmpColor.r + hoverColor.r * ring);
      tmpColor.g = Math.min(1, tmpColor.g + hoverColor.g * ring);
      tmpColor.b = Math.min(1, tmpColor.b + hoverColor.b * ring);
      mesh.setColorAt(i, tmpColor);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;

    renderer.render(scene, camera);
  }
  tick();
}

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  applyResponsiveLayout(w);
}

onMounted(() => {
  init();
  startLoop();
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseleave", onMouseLeave);
  window.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  cancelAnimationFrame(animFrameId);
  renderer?.dispose();
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseleave", onMouseLeave);
  window.removeEventListener("pointerdown", onPointerDown);
  window.removeEventListener("resize", onResize);
});
</script>

<style scoped>
.grid-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: -1;
}
</style>
