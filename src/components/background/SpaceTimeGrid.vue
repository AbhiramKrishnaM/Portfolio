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
import { story, progressBetween, prefersReducedMotion } from "@/composables/storyline.js";
import CONTRIBUTIONS from "@/data/contributions.json";

const { theme } = useTheme();

const canvasRef = ref(null);
let renderer, scene, camera, group, mesh, raycaster, animFrameId, gridUniforms;

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

const COLS = 64;
const ROWS = 60;
const CELL = 0.34;
const FILL = 0.72;
const WELL_RADIUS = 2.2;
const WELL_DEPTH = 0.55;
const TERMINAL_WELL_RADIUS = 4.2;
const TERMINAL_WELL_DEPTH = 1.15;
const WELL_EASE = 0.1;
const CAMERA_EASE = 0.06;

const CAMERA_POSES = {
  hero: { pos: [0, 1.3, 6], look: [0, -1, -3] },
  projects: { pos: [0.6, 0.75, 4.6], look: [0.5, -1.25, -3.4] },
  stack: { pos: [1.1, 2.7, 3.6], look: [1.0, -1.5, -1.6] },
  experience: { pos: [-1.8, 1.0, 4.9], look: [-1.6, -1.1, -3] },
  about: { pos: [1.7, 1.15, 5.0], look: [1.4, -1.0, -3] },
  contact: { pos: [0, 2.4, 8.2], look: [0, -1.2, -3] },
};

function cameraSegments(m) {
  return [
    { from: "hero", to: "projects", start: m.heroTop, end: m.projectsTop },
    { from: "projects", to: "stack", start: m.stackStart - m.vh * 0.35, end: m.stackStart },
    { from: "stack", to: "experience", start: m.pinEnd, end: m.experienceTop - m.vh * 0.2 },
    { from: "experience", to: "about", start: m.aboutTop - m.vh, end: m.aboutTop - m.vh * 0.2 },
    { from: "about", to: "contact", start: m.contactEnter, end: m.contactSettle },
  ];
}

const easeInOut = (t) => t * t * (3 - 2 * t);

function wellFalloff(dist, radius) {
  if (dist >= radius) return 0;
  const k = 1 - (dist / radius) ** 2;
  return k * k;
}

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

const MAX_WAVES = 6;
const WAVE_RING_SPEED = 2.4;
const WAVE_RING_WIDTH = 0.55;
const WAVE_RING_HEIGHT = 0.55;
const WAVE_RING_LIFETIME = 2.4;
let activeWaves = [];
let currentT = 0;

function spawnEnergyWave(x, y, strength = 1) {
  if (activeWaves.length >= MAX_WAVES) activeWaves.shift();
  activeWaves.push({ x, y, start: currentT, strength });
}

const CONTRIB_SCREEN = [0.0, -0.45];
const CONTRIB_GLOW = [0, 0.35, 0.55, 0.8, 1];
const CONTRIB_LIFT = 0.06;

let cellCenters = null;
let contribGlow = null;
let contribPeriod = null;
let contribOffset = null;
let well = null;
const _matrix = new Matrix4();
const _mousePoint = new Vector3();
const _planeNormal = new Vector3();
const groundPlane = new ThreePlane();

let tmx = null, tmy = null;
let finePointer = true;
let motionAllowed = true;
const cameraPos = new Vector3(...CAMERA_POSES.hero.pos);
const cameraLook = new Vector3(...CAMERA_POSES.hero.look);
const targetPos = new Vector3();
const targetLook = new Vector3();
const _poseA = new Vector3();
const _poseB = new Vector3();
const _ndc = new Vector2();

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
    ...UniformsUtils.clone(UniformsLib.fog),
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
  well = new Float32Array(count);

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

function contributionOrigin() {
  const pose = CAMERA_POSES.about;
  const saved = { pos: camera.position.clone(), quat: camera.quaternion.clone() };
  camera.position.fromArray(pose.pos);
  camera.lookAt(_poseA.fromArray(pose.look));
  camera.updateMatrixWorld();
  group.updateMatrixWorld();
  updateGroundPlane();
  const hit = groundPointFromScreen(CONTRIB_SCREEN[0], CONTRIB_SCREEN[1], _mousePoint);
  camera.position.copy(saved.pos);
  camera.quaternion.copy(saved.quat);
  camera.updateMatrixWorld();
  const weeks = Math.ceil(CONTRIBUTIONS.days.length / 7);
  const centerCol = hit ? Math.round((_mousePoint.x + (COLS * CELL) / 2) / CELL) : COLS / 2;
  const centerRow = hit ? Math.round((_mousePoint.y + (ROWS * CELL) / 2) / CELL) : ROWS / 2;
  return {
    col0: Math.max(0, Math.min(COLS - weeks, centerCol - Math.floor(weeks / 2))),
    row0: Math.max(0, Math.min(ROWS - 7, centerRow - 3)),
  };
}

function mapContributions(count) {
  contribGlow = new Float32Array(count);
  contribPeriod = new Float32Array(count);
  contribOffset = new Float32Array(count);
  const { col0, row0 } = contributionOrigin();
  CONTRIBUTIONS.days.forEach((day, i) => {
    const col = col0 + Math.floor(i / 7);
    const row = row0 + 6 - (i % 7);
    if (col >= COLS || row >= ROWS) return;
    const index = row * COLS + col;
    contribGlow[index] = CONTRIB_GLOW[day.level] ?? 0;
    contribPeriod[index] = 13 + Math.random() * 8;
    contribOffset[index] = Math.random() * 21;
  });
}

function twinkle(index, t) {
  if (!motionAllowed) return 1;
  const phase = ((t + contribOffset[index]) / contribPeriod[index]) % 1;
  if (phase < 0.92) return 1;
  return 1 - 0.8 * (1 - Math.abs(phase - 0.96) / 0.04);
}

function contributionStrength(scroll) {
  const m = story.markers;
  if (!m) return 0;
  return progressBetween(scroll, m.aboutTop - m.vh, m.aboutTop - m.vh * 0.4);
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
  camera.position.copy(cameraPos);
  camera.lookAt(cameraLook);

  raycaster = new Raycaster();

  group = new Group();
  group.rotation.x = -Math.PI * 0.42;
  scene.add(group);

  applyThemeColors();
  buildGrid();
  applyThemeColors();
  applyResponsiveLayout(w);
  mapContributions(COLS * ROWS);
}

function onMouseMove(e) {
  if (!finePointer || !motionAllowed) return;
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

function waveFromScreen(clientX, clientY, strength) {
  const ndcX = (clientX / window.innerWidth) * 2 - 1;
  const ndcY = -((clientY / window.innerHeight) * 2 - 1);
  updateGroundPlane();
  if (groundPointFromScreen(ndcX, ndcY, _mousePoint)) spawnEnergyWave(_mousePoint.x, _mousePoint.y, strength);
}

function onPointerDown(e) {
  waveFromScreen(e.clientX, e.clientY, 1);
}

function consumeImpulses() {
  while (story.impulses.length) {
    const impulse = story.impulses.shift();
    if (motionAllowed) waveFromScreen(impulse.x, impulse.y, impulse.strength * 1.4);
  }
}

function groundPointFromScreen(ndcX, ndcY, out) {
  _ndc.set(ndcX, ndcY);
  raycaster.setFromCamera(_ndc, camera);
  if (!raycaster.ray.intersectPlane(groundPlane, out)) return false;
  group.worldToLocal(out);
  return true;
}

function terminalWell() {
  const { progress, el } = story.flight;
  if (!motionAllowed || !el || progress <= 0 || progress >= 1) return null;
  const rect = el.getBoundingClientRect();
  const ndcX = ((rect.left + rect.width / 2) / window.innerWidth) * 2 - 1;
  const ndcY = -(((rect.top + rect.height / 2) / window.innerHeight) * 2 - 1);
  if (!groundPointFromScreen(ndcX, ndcY, _mousePoint)) return null;
  return { x: _mousePoint.x, y: _mousePoint.y, strength: Math.sin(Math.PI * progress) };
}

function updateCameraTarget(scroll) {
  const markers = story.markers;
  let fromPose = CAMERA_POSES.hero;
  let toPose = CAMERA_POSES.hero;
  let t = 0;
  if (markers && motionAllowed) {
    for (const seg of cameraSegments(markers)) {
      const segT = progressBetween(scroll, seg.start, seg.end);
      if (segT <= 0) break;
      fromPose = CAMERA_POSES[seg.from];
      toPose = CAMERA_POSES[seg.to];
      t = easeInOut(segT);
    }
  }
  targetPos.copy(_poseA.fromArray(fromPose.pos)).lerp(_poseB.fromArray(toPose.pos), t);
  targetLook.copy(_poseA.fromArray(fromPose.look)).lerp(_poseB.fromArray(toPose.look), t);
}

function startLoop() {
  const t0 = performance.now();

  function tick() {
    animFrameId = requestAnimationFrame(tick);
    const t = (performance.now() - t0) / 1000;
    currentT = t;

    group.rotation.z = Math.sin(t * 0.12) * 0.03;

    updateCameraTarget(window.scrollY);
    cameraPos.lerp(targetPos, CAMERA_EASE);
    cameraLook.lerp(targetLook, CAMERA_EASE);
    camera.position.copy(cameraPos);
    camera.lookAt(cameraLook);

    updateGroundPlane();

    let localX = null, localY = null;
    if (tmx !== null && groundPointFromScreen(tmx, tmy, _mousePoint)) {
      localX = _mousePoint.x;
      localY = _mousePoint.y;
    }
    const mass = terminalWell();
    consumeImpulses();

    if (activeWaves.length) {
      activeWaves = activeWaves.filter((w) => t - w.start < WAVE_RING_LIFETIME);
    }

    const count = COLS * ROWS;
    const contrib = contributionStrength(window.scrollY);
    for (let i = 0; i < count; i++) {
      const cx = cellCenters[i * 2];
      const cy = cellCenters[i * 2 + 1];

      let target = 0;
      if (localX !== null) {
        target += wellFalloff(Math.hypot(cx - localX, cy - localY), WELL_RADIUS) * WELL_DEPTH;
      }
      if (mass) {
        target += wellFalloff(Math.hypot(cx - mass.x, cy - mass.y), TERMINAL_WELL_RADIUS) * TERMINAL_WELL_DEPTH * mass.strength;
      }

      well[i] += (target - well[i]) * WELL_EASE;
      const l = Math.min(1, well[i] / WELL_DEPTH);
      const wave = waveHeight(cx, cy, t);

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
        ring += front * front * decay * rw.strength;
      }

      const glow = contrib > 0 && contribGlow[i] > 0 ? contribGlow[i] * contrib * twinkle(i, t) : 0;

      _matrix.makeTranslation(cx, cy, wave - well[i] + ring * WAVE_RING_HEIGHT + glow * CONTRIB_LIFT);
      mesh.setMatrixAt(i, _matrix);

      tmpColor.copy(baseColor).lerp(hoverColor, Math.max(l, glow));
      tmpColor.multiplyScalar(1 + wave * 0.9 + glow * 0.5);
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
  finePointer = window.matchMedia("(pointer: fine)").matches;
  motionAllowed = !prefersReducedMotion();
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
