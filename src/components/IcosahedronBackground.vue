<template>
  <canvas ref="canvasRef" class="icosa-canvas" />
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import {
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshNormalMaterial,
  PerspectiveCamera,
  Quaternion,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from "three";
import { useTheme } from "@/composables/useTheme.js";

const { theme } = useTheme();

const canvasRef = ref(null);
let renderer, scene, camera, group, animFrameId;
const allUniforms = [];
let faceUni, edgeUni;

const THEME_COLORS = {
  dark: {
    faceBase: [0.004, 0.09, 0.15],
    faceShade: [0.0, 0.06, 0.14],
    faceRim: [0.0, 0.55, 0.8],
    faceAlpha: 0.55,
    edge: [0.55, 0.8, 1.0, 0.3],
  },
  light: {
    faceBase: [0.9, 0.945, 0.975],
    faceShade: [-0.05, -0.04, -0.02],
    faceRim: [0.25, 0.29, 0.69],
    faceAlpha: 0.6,
    edge: [0.004, 0.086, 0.153, 0.55],
  },
};

function applyThemeColors() {
  const c = THEME_COLORS[theme.value] ?? THEME_COLORS.dark;
  if (faceUni) {
    faceUni.uBaseColor.value.set(...c.faceBase);
    faceUni.uShadeColor.value.set(...c.faceShade);
    faceUni.uRimColor.value.set(...c.faceRim);
    faceUni.uAlpha.value = c.faceAlpha;
  }
  if (edgeUni) {
    edgeUni.uEdgeColor.value.set(...c.edge);
  }
}

watch(theme, applyThemeColors);

let mx = 0, my = 0, tmx = 0, tmy = 0;

const vert = `
  uniform vec2 uMouse;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 pos = position;

    vec4  clip   = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vec2  ndc    = clip.xy / clip.w;
    float aspect = projectionMatrix[1][1] / projectionMatrix[0][0];
    float dist   = length(vec2((ndc.x - uMouse.x) * aspect, ndc.y - uMouse.y));
    float pull   = smoothstep(0.42, 0.0, dist) * 0.72;
    pos         += normalize(pos) * pull;

    vec4 mvPos  = modelViewMatrix * vec4(pos, 1.0);
    vViewDir    = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const edgeVert = `
  uniform vec2 uMouse;

  void main() {
    vec3 pos  = position;
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vec2 ndc  = clip.xy / clip.w;

    float aspect = projectionMatrix[1][1] / projectionMatrix[0][0];
    float dist   = length(vec2((ndc.x - uMouse.x) * aspect, ndc.y - uMouse.y));
    float pull   = smoothstep(0.42, 0.0, dist) * 0.72;
    pos         += normalize(pos) * pull;
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const faceFrag = `
  uniform vec3 uBaseColor;
  uniform vec3 uShadeColor;
  uniform vec3 uRimColor;
  uniform float uAlpha;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec3 n = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
    vec3 col = uBaseColor;
    col += max(dot(n, normalize(vec3(1.0, 1.5, 2.0))), 0.0) * uShadeColor;
    float fres = 1.0 - abs(dot(n, normalize(vViewDir)));
    col += pow(fres, 3.0) * uRimColor * 0.28;
    gl_FragColor = vec4(col, uAlpha);
  }
`;

const edgeFrag = `
  uniform vec4 uEdgeColor;
  void main() {
    gl_FragColor = uEdgeColor;
  }
`;

function createSpaceship() {
  const root = new Group();
  const bodyMat = new MeshNormalMaterial({ flatShading: true });
  const glowMat = new MeshBasicMaterial({
    color: 0x40ffcc, transparent: true, opacity: 0.90,
  });
  const exhaustMat = new MeshBasicMaterial({
    color: 0x40ffcc, transparent: true, opacity: 0.25,
  });

  const fuselage = new Mesh(
    new CylinderGeometry(0.052, 0.088, 0.40, 6),
    bodyMat,
  );
  fuselage.rotation.x = Math.PI / 2;
  root.add(fuselage);

  const nose = new Mesh(new ConeGeometry(0.052, 0.20, 6), bodyMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.z = 0.30;
  root.add(nose);

  const wings = new Mesh(new BoxGeometry(0.44, 0.012, 0.18), bodyMat);
  wings.position.z = -0.04;
  root.add(wings);

  const cockpit = new Mesh(
    new SphereGeometry(0.042, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    new MeshBasicMaterial({ color: 0x80dfff, transparent: true, opacity: 0.7 }),
  );
  cockpit.position.z = 0.14;
  cockpit.position.y = 0.048;
  root.add(cockpit);

  const engineMesh = new Mesh(new SphereGeometry(0.048, 10, 10), glowMat);
  engineMesh.position.z = -0.23;
  root.add(engineMesh);

  const exhaust = new Mesh(
    new ConeGeometry(0.034, 0.14, 8),
    exhaustMat,
  );
  exhaust.rotation.x = Math.PI / 2;
  exhaust.position.z = -0.33;
  root.add(exhaust);

  return { root, engineMesh };
}

function buildFacePlanes(radius) {
  const geo = new IcosahedronGeometry(radius, 0);
  const pos = geo.attributes.position;
  const planes = [];

  for (let i = 0; i < pos.count; i += 3) {
    const a = new Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
    const b = new Vector3(pos.getX(i + 1), pos.getY(i + 1), pos.getZ(i + 1));
    const c = new Vector3(pos.getX(i + 2), pos.getY(i + 2), pos.getZ(i + 2));

    const n = new Vector3()
      .crossVectors(b.clone().sub(a), c.clone().sub(a))
      .normalize();
    if (n.dot(a) < 0) n.negate();

    planes.push({ n, d: n.dot(a) });
  }
  return planes;
}

let shipMesh = null;
let engineRef = null;
let facePlanes = null;
let shipVel = new Vector3();
const _targetQ = new Quaternion();
const _forward = new Vector3(0, 0, 1);
const SHIP_SPEED = 0.90;
const SHIP_MARGIN = 0.20;

let isMobile = false;
let solarSystemGroup = null;
let coronaMesh = null;
const planets = [];
let mobileTarget = 0;
const MOBILE_SHIP_SPEED = 0.55;

function createSolarSystem() {
  solarSystemGroup = new Group();

  solarSystemGroup.add(new Mesh(
    new SphereGeometry(0.16, 14, 14),
    new MeshBasicMaterial({ color: 0xffc107 })
  ));

  coronaMesh = new Mesh(
    new SphereGeometry(0.24, 14, 14),
    new MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.22 })
  );
  solarSystemGroup.add(coronaMesh);

  solarSystemGroup.rotation.x = -Math.PI * 0.52;
  solarSystemGroup.rotation.z = 0.28;

  const planetDefs = [
    { orbitRadius: 0.30, size: 0.048, color: 0xe8cda0, speed: 2.2,  tilt: 0.0,   rings: null },
    { orbitRadius: 0.52, size: 0.060, color: 0x4fc3f7, speed: 1.5,  tilt: 0.05,  rings: null },
    { orbitRadius: 0.78, size: 0.082, color: 0x81c784, speed: 0.88, tilt: 0.08,  rings: null },
    { orbitRadius: 1.08, size: 0.068, color: 0xff7043, speed: 0.52, tilt: -0.06, rings: null },
    { orbitRadius: 1.38, size: 0.090, color: 0xce93d8, speed: 0.30, tilt: 0.10,  rings: null },
    { orbitRadius: 1.68, size: 0.115, color: 0xc88b3a, speed: 0.18, tilt: -0.08,
      rings: { inner: 0.145, outer: 0.26, color: 0xb07830, opacity: 0.55 } },
  ];

  for (const pd of planetDefs) {
    const ringPts = [];
    for (let i = 0; i <= 80; i++) {
      const a = (i / 80) * Math.PI * 2;
      ringPts.push(new Vector3(Math.cos(a) * pd.orbitRadius, 0, Math.sin(a) * pd.orbitRadius));
    }
    solarSystemGroup.add(new LineLoop(
      new BufferGeometry().setFromPoints(ringPts),
      new LineBasicMaterial({ color: 0x1e3a50, transparent: true, opacity: 0.5 })
    ));

    const mesh = new Mesh(
      new SphereGeometry(pd.size, 12, 12),
      new MeshBasicMaterial({ color: pd.color })
    );
    const startAngle = Math.random() * Math.PI * 2;
    mesh.position.set(Math.cos(startAngle) * pd.orbitRadius, pd.tilt, Math.sin(startAngle) * pd.orbitRadius);

    if (pd.rings) {
      const planetRing = new Mesh(
        new RingGeometry(pd.rings.inner, pd.rings.outer, 48),
        new MeshBasicMaterial({
          color: pd.rings.color, transparent: true,
          opacity: pd.rings.opacity, side: DoubleSide,
        })
      );
      planetRing.rotation.x = Math.PI * 0.44;
      planetRing.rotation.z = 0.22;
      mesh.add(planetRing);
    }

    solarSystemGroup.add(mesh);
    planets.push({ mesh, orbitRadius: pd.orbitRadius, orbitSpeed: pd.speed, angle: startAngle, tilt: pd.tilt });
  }

  group.add(solarSystemGroup);
  solarSystemGroup.visible = false;
}

function applyResponsiveLayout(w, h) {
  isMobile = w < 1024;

  if (isMobile) {
    const visibleHeight = 2 * Math.tan((Math.PI / 180) * 22.5) * 7;
    const visibleWidth = visibleHeight * (w / h);
    const scale = Math.min((visibleWidth * 0.95) / (2 * 2.4), 0.92);

    const maxY = visibleHeight / 2 - 2.4 * scale - 0.18;
    group.position.x = 0;
    group.position.y = Math.min(visibleHeight * 0.10, maxY);
    group.scale.setScalar(scale);

    if (solarSystemGroup) solarSystemGroup.visible = true;
    if (shipMesh) shipMesh.scale.setScalar(0.5);
  } else {
    group.position.x = 1.2;
    group.position.y = 0;
    group.scale.setScalar(1.0);

    if (solarSystemGroup) solarSystemGroup.visible = false;
    if (shipMesh) shipMesh.scale.setScalar(1.0);
  }
}

function init() {
  const canvas = canvasRef.value;
  const w = window.innerWidth;
  const h = window.innerHeight;

  renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene = new Scene();
  camera = new PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.z = 7;

  group = new Group();
  scene.add(group);

  const mouseVec = new Vector2(0, 0);

  const faceGeo = new IcosahedronGeometry(2.4, 1);
  faceUni = {
    uMouse: { value: mouseVec },
    uBaseColor: { value: new Vector3() },
    uShadeColor: { value: new Vector3() },
    uRimColor: { value: new Vector3() },
    uAlpha: { value: 0.55 },
  };
  allUniforms.push(faceUni);
  group.add(new Mesh(faceGeo, new ShaderMaterial({
    vertexShader: vert, fragmentShader: faceFrag,
    uniforms: faceUni, transparent: true,
    side: DoubleSide, depthWrite: false,
  })));

  const edgeGeo = new EdgesGeometry(new IcosahedronGeometry(2.4, 1));
  edgeUni = { uMouse: { value: mouseVec }, uEdgeColor: { value: new Vector4() } };
  allUniforms.push(edgeUni);
  group.add(new LineSegments(edgeGeo, new ShaderMaterial({
    vertexShader: edgeVert, fragmentShader: edgeFrag,
    uniforms: edgeUni, transparent: true,
  })));

  applyThemeColors();

  const { root, engineMesh } = createSpaceship();
  shipMesh = root;
  engineRef = engineMesh;
  shipVel.set(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5,
  ).normalize().multiplyScalar(SHIP_SPEED);
  group.add(shipMesh);

  facePlanes = buildFacePlanes(2.4);

  createSolarSystem();

  applyResponsiveLayout(w, h);
}

function onMouseMove(e) {
  tmx = (e.clientX / window.innerWidth) * 2 - 1;
  tmy = -((e.clientY / window.innerHeight) * 2 - 1);
}

function startLoop() {
  const t0 = performance.now();
  let prevT = 0;

  function tick() {
    animFrameId = requestAnimationFrame(tick);
    const t = (performance.now() - t0) / 1000;
    const dt = Math.min(t - prevT, 0.05);
    prevT = t;

    mx += (tmx - mx) * 0.05;
    my += (tmy - my) * 0.05;
    allUniforms.forEach(u => u.uMouse.value.set(mx, my));

    group.rotation.y = t * 0.18;
    group.rotation.x = Math.sin(t * 0.10) * 0.12;

    if (isMobile && planets.length > 0) {
      for (const p of planets) {
        p.angle += p.orbitSpeed * dt;
        p.mesh.position.set(
          Math.cos(p.angle) * p.orbitRadius,
          p.tilt * Math.sin(p.angle * 2),
          Math.sin(p.angle) * p.orbitRadius
        );
      }

      if (coronaMesh) {
        coronaMesh.scale.setScalar(0.9 + 0.1 * Math.sin(t * 2.8));
      }

      const target = planets[mobileTarget];
      const planetGroupPos = new Vector3();
      target.mesh.getWorldPosition(planetGroupPos);
      group.worldToLocal(planetGroupPos);

      const toTarget = planetGroupPos.sub(shipMesh.position);
      const dist = toTarget.length();
      if (dist < 0.18) {
        let next = mobileTarget;
        while (next === mobileTarget) next = Math.floor(Math.random() * planets.length);
        mobileTarget = next;
      }
      shipVel.copy(toTarget.normalize().multiplyScalar(MOBILE_SHIP_SPEED));
      shipMesh.position.addScaledVector(shipVel, dt);
    } else {
      shipMesh.position.addScaledVector(shipVel, dt);
      for (const { n, d } of facePlanes) {
        const penetration = n.dot(shipMesh.position) - (d - SHIP_MARGIN);
        if (penetration > 0) {
          shipVel.reflect(n);
          shipMesh.position.addScaledVector(n, -(penetration + 0.01));
          break;
        }
      }
    }

    if (shipVel.lengthSq() > 0.001) {
      _targetQ.setFromUnitVectors(_forward, shipVel.clone().normalize());
      shipMesh.quaternion.slerp(_targetQ, 0.14);
    }

    const pulse = 0.85 + 0.15 * Math.sin(t * 9.0);
    engineRef.scale.setScalar(pulse);

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
  applyResponsiveLayout(w, h);
}

onMounted(() => {
  init();
  startLoop();
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  cancelAnimationFrame(animFrameId);
  renderer?.dispose();
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("resize", onResize);
});
</script>

<style scoped>
.icosa-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
}
</style>
