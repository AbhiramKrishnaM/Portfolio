<template>
  <canvas ref="canvasRef" class="icosa-canvas" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";

const canvasRef = ref(null);
let renderer, scene, camera, group, animFrameId;
const allUniforms = [];

// Smoothed mouse in NDC [-1, 1]
let mx = 0, my = 0, tmx = 0, tmy = 0;

// ── Vertex shader — screen-space mouse proximity pull ─────────────────────
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
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec3 n = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
    vec3 col = vec3(0.004, 0.09, 0.15);
    col += max(dot(n, normalize(vec3(1.0, 1.5, 2.0))), 0.0) * vec3(0.0, 0.06, 0.14);
    float fres = 1.0 - abs(dot(n, normalize(vViewDir)));
    col += pow(fres, 3.0) * vec3(0.0, 0.55, 0.80) * 0.28;
    gl_FragColor = vec4(col, 0.55);
  }
`;

const edgeFrag = `
  void main() {
    gl_FragColor = vec4(0.55, 0.80, 1.0, 0.30);
  }
`;

// ── Spaceship geometry ─────────────────────────────────────────────────────
// Nose of ship points toward +Z. We'll orient it by aligning +Z → velocity.
function createSpaceship() {
  const root = new THREE.Group();
  const bodyMat = new THREE.MeshNormalMaterial({ flatShading: true });
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x40ffcc, transparent: true, opacity: 0.90,
  });
  const exhaustMat = new THREE.MeshBasicMaterial({
    color: 0x40ffcc, transparent: true, opacity: 0.25,
  });

  // Fuselage — tapered cylinder oriented along +Z
  const fuselage = new THREE.Mesh(
    new THREE.CylinderGeometry(0.052, 0.088, 0.40, 6),
    bodyMat,
  );
  fuselage.rotation.x = Math.PI / 2;
  root.add(fuselage);

  // Nose cone
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.20, 6), bodyMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.z = 0.30;
  root.add(nose);

  // Wings — flat box swept back
  const wings = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.012, 0.18), bodyMat);
  wings.position.z = -0.04;
  root.add(wings);

  // Cockpit dome
  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(0.042, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x80dfff, transparent: true, opacity: 0.7 }),
  );
  cockpit.position.z = 0.14;
  cockpit.position.y = 0.048;
  root.add(cockpit);

  // Engine glow
  const engineMesh = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), glowMat);
  engineMesh.position.z = -0.23;
  root.add(engineMesh);

  // Exhaust cone
  const exhaust = new THREE.Mesh(
    new THREE.ConeGeometry(0.034, 0.14, 8),
    exhaustMat,
  );
  exhaust.rotation.x = Math.PI / 2;
  exhaust.position.z = -0.33;
  root.add(exhaust);

  return { root, engineMesh };
}

// ── Face collision planes from the base icosahedron (detail=0, 20 faces) ──
// Each plane: outward unit normal n, plane distance d (dot(n, p) = d).
// Ship bounces when dot(n, shipPos) > d - margin.
function buildFacePlanes(radius) {
  const geo = new THREE.IcosahedronGeometry(radius, 0);
  const pos = geo.attributes.position;
  const planes = [];

  for (let i = 0; i < pos.count; i += 3) {
    const a = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
    const b = new THREE.Vector3(pos.getX(i + 1), pos.getY(i + 1), pos.getZ(i + 1));
    const c = new THREE.Vector3(pos.getX(i + 2), pos.getY(i + 2), pos.getZ(i + 2));

    const n = new THREE.Vector3()
      .crossVectors(b.clone().sub(a), c.clone().sub(a))
      .normalize();
    if (n.dot(a) < 0) n.negate();   // ensure outward

    planes.push({ n, d: n.dot(a) });
  }
  return planes;
}

// ── Ship state ─────────────────────────────────────────────────────────────
let shipMesh = null;
let engineRef = null;
let facePlanes = null;
let shipVel = new THREE.Vector3();
const _targetQ = new THREE.Quaternion();
const _forward = new THREE.Vector3(0, 0, 1);
const SHIP_SPEED = 0.90;
const SHIP_MARGIN = 0.20;

// ── Mobile solar system state ──────────────────────────────────────────────
let isMobile = false;
let solarSystemGroup = null;
let coronaMesh = null;
const planets = [];
let mobileTarget = 0;
const MOBILE_SHIP_SPEED = 0.55;

// ── Solar system (shown on mobile only) ───────────────────────────────────
function createSolarSystem() {
  solarSystemGroup = new THREE.Group();

  // Sun core
  solarSystemGroup.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0xffc107 })
  ));

  // Sun corona — pulsed each frame
  coronaMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.22 })
  );
  solarSystemGroup.add(coronaMesh);

  // Tilt the whole orbital plane to face the camera (camera is at +Z, orbits were in XZ = edge-on)
  // -π/2 on X rotates the XZ plane into XY plane → orbits appear as circles from camera
  solarSystemGroup.rotation.x = -Math.PI * 0.52;
  solarSystemGroup.rotation.z = 0.28; // slight artistic tilt

  const planetDefs = [
    { orbitRadius: 0.30, size: 0.048, color: 0xe8cda0, speed: 2.2,  tilt: 0.0,   rings: null },
    { orbitRadius: 0.52, size: 0.060, color: 0x4fc3f7, speed: 1.5,  tilt: 0.05,  rings: null },
    { orbitRadius: 0.78, size: 0.082, color: 0x81c784, speed: 0.88, tilt: 0.08,  rings: null },
    { orbitRadius: 1.08, size: 0.068, color: 0xff7043, speed: 0.52, tilt: -0.06, rings: null },
    { orbitRadius: 1.38, size: 0.090, color: 0xce93d8, speed: 0.30, tilt: 0.10,  rings: null },
    // Jupiter with rings
    { orbitRadius: 1.68, size: 0.115, color: 0xc88b3a, speed: 0.18, tilt: -0.08,
      rings: { inner: 0.145, outer: 0.26, color: 0xb07830, opacity: 0.55 } },
  ];

  for (const pd of planetDefs) {
    // Orbit path
    const ringPts = [];
    for (let i = 0; i <= 80; i++) {
      const a = (i / 80) * Math.PI * 2;
      ringPts.push(new THREE.Vector3(Math.cos(a) * pd.orbitRadius, 0, Math.sin(a) * pd.orbitRadius));
    }
    solarSystemGroup.add(new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(ringPts),
      new THREE.LineBasicMaterial({ color: 0x1e3a50, transparent: true, opacity: 0.5 })
    ));

    // Planet sphere
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(pd.size, 12, 12),
      new THREE.MeshBasicMaterial({ color: pd.color })
    );
    const startAngle = Math.random() * Math.PI * 2;
    mesh.position.set(Math.cos(startAngle) * pd.orbitRadius, pd.tilt, Math.sin(startAngle) * pd.orbitRadius);

    // Saturn-style rings attached to planet so they orbit with it
    if (pd.rings) {
      const planetRing = new THREE.Mesh(
        new THREE.RingGeometry(pd.rings.inner, pd.rings.outer, 48),
        new THREE.MeshBasicMaterial({
          color: pd.rings.color, transparent: true,
          opacity: pd.rings.opacity, side: THREE.DoubleSide,
        })
      );
      // RingGeometry is in XY plane by default; rotate into XZ (orbital plane) + slight tilt for aesthetics
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

// ── Responsive layout ──────────────────────────────────────────────────────
function applyResponsiveLayout(w, h) {
  isMobile = w < 1024;

  if (isMobile) {
    // Scale icosahedron so its diameter fills ~78% of visible screen width
    const visibleHeight = 2 * Math.tan((Math.PI / 180) * 22.5) * 7; // camera FOV=45, z=7
    const visibleWidth = visibleHeight * (w / h);
    const scale = Math.min((visibleWidth * 0.95) / (2 * 2.4), 0.92);

    // Clamp Y so the top of the icosahedron never exceeds the viewport edge
    const maxY = visibleHeight / 2 - 2.4 * scale - 0.18;
    group.position.x = 0;
    group.position.y = Math.min(visibleHeight * 0.10, maxY);
    group.scale.setScalar(scale);

    if (solarSystemGroup) solarSystemGroup.visible = true;
    if (shipMesh) shipMesh.scale.setScalar(0.5); // extra-small rocket on mobile
  } else {
    group.position.x = 1.2;
    group.position.y = 0;
    group.scale.setScalar(1.0);

    if (solarSystemGroup) solarSystemGroup.visible = false;
    if (shipMesh) shipMesh.scale.setScalar(1.0);
  }
}

// ── Scene init ─────────────────────────────────────────────────────────────
function init() {
  const canvas = canvasRef.value;
  const w = window.innerWidth;
  const h = window.innerHeight;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.z = 7;

  group = new THREE.Group();
  scene.add(group);

  const mouseVec = new THREE.Vector2(0, 0);

  // Icosahedron faces
  const faceGeo = new THREE.IcosahedronGeometry(2.4, 1);
  const faceUni = { uMouse: { value: mouseVec } };
  allUniforms.push(faceUni);
  group.add(new THREE.Mesh(faceGeo, new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: faceFrag,
    uniforms: faceUni, transparent: true,
    side: THREE.DoubleSide, depthWrite: false,
  })));

  // Wireframe edges
  const edgeGeo = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.4, 1));
  const edgeUni = { uMouse: { value: mouseVec } };
  allUniforms.push(edgeUni);
  group.add(new THREE.LineSegments(edgeGeo, new THREE.ShaderMaterial({
    vertexShader: edgeVert, fragmentShader: edgeFrag,
    uniforms: edgeUni, transparent: true,
  })));

  // Spaceship
  const { root, engineMesh } = createSpaceship();
  shipMesh = root;
  engineRef = engineMesh;
  shipVel.set(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5,
  ).normalize().multiplyScalar(SHIP_SPEED);
  group.add(shipMesh);

  // Collision planes for desktop bounce (detail=0, same radius)
  facePlanes = buildFacePlanes(2.4);

  // Solar system (hidden until mobile layout applies)
  createSolarSystem();

  applyResponsiveLayout(w, h);
}

// ── Mouse handler ──────────────────────────────────────────────────────────
function onMouseMove(e) {
  tmx = (e.clientX / window.innerWidth) * 2 - 1;
  tmy = -((e.clientY / window.innerHeight) * 2 - 1);
}

// ── Render loop ────────────────────────────────────────────────────────────
function startLoop() {
  const t0 = performance.now();
  let prevT = 0;

  function tick() {
    animFrameId = requestAnimationFrame(tick);
    const t = (performance.now() - t0) / 1000;
    const dt = Math.min(t - prevT, 0.05);
    prevT = t;

    // Mouse smooth
    mx += (tmx - mx) * 0.05;
    my += (tmy - my) * 0.05;
    allUniforms.forEach(u => u.uMouse.value.set(mx, my));

    // Icosahedron idle rotation
    group.rotation.y = t * 0.18;
    group.rotation.x = Math.sin(t * 0.10) * 0.12;

    // ── Ship physics ───────────────────────────────────────────────────
    if (isMobile && planets.length > 0) {
      // Animate planet orbits (positions are in solarSystemGroup / group local space)
      for (const p of planets) {
        p.angle += p.orbitSpeed * dt;
        p.mesh.position.set(
          Math.cos(p.angle) * p.orbitRadius,
          p.tilt * Math.sin(p.angle * 2), // slight inclination wobble
          Math.sin(p.angle) * p.orbitRadius
        );
      }

      // Sun corona pulse
      if (coronaMesh) {
        coronaMesh.scale.setScalar(0.9 + 0.1 * Math.sin(t * 2.8));
      }

      // Move rocket toward current target planet then pick a random different one
      // Planet positions are in solarSystemGroup local space; ship is in group local space.
      // Convert planet world position → group local to compare correctly.
      const target = planets[mobileTarget];
      const planetGroupPos = new THREE.Vector3();
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
      // Desktop: bounce inside icosahedron
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

    // Orient nose toward velocity (shared)
    if (shipVel.lengthSq() > 0.001) {
      _targetQ.setFromUnitVectors(_forward, shipVel.clone().normalize());
      shipMesh.quaternion.slerp(_targetQ, 0.14);
    }

    // Engine glow pulse (shared)
    const pulse = 0.85 + 0.15 * Math.sin(t * 9.0);
    engineRef.scale.setScalar(pulse);

    renderer.render(scene, camera);
  }
  tick();
}

// ── Resize ─────────────────────────────────────────────────────────────────
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
