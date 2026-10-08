<template>
  <div class="node-modules-story" aria-hidden="true">
    <canvas ref="keyboardCanvasRef" class="keyboard-canvas" />
    <canvas ref="canvasRef" class="box-canvas" />
    <div class="logo-layer">
      <div v-for="(item, i) in STACK" :key="item.id" :ref="(el) => { tileEls[i] = el; }" class="logo-body"
        :class="{ 'logo-body--grabbable': grabbable }" :style="{ '--tile-size': `${TILE_PX}px` }" :data-cursor="grabbable ? 'throw me' : null"
        @pointerdown="onPointerDown($event, i)" @dragstart.prevent>
        <StackTile :item="item" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import gsap from "gsap";
import {
  AmbientLight,
  DirectionalLight,
  OrthographicCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import StackTile from "@/components/stack/StackTile.vue";
import { STACK } from "@/data/stack.js";
import { story, progressBetween, contactRevealed, pushImpulse } from "@/composables/storyline.js";
import { unlock } from "@/composables/achievements.js";
import { createCardboardBox, BOX } from "./cardboardBox.js";
import { createStackPhysics } from "./stackPhysics.js";
import { createKeyboard } from "./keyboard.js";
import { onKeystroke } from "@/composables/typingBus.js";
import { useTheme } from "@/composables/useTheme.js";

const TILE_PX = 84;
const TILT_X = 0.38;
const BASE_ROT_Y = -0.62;
const POSE_EASE = 0.22;
const RETURN_MS = 450;
const EMERGE_MS = 320;
const HANDOFF_SIZE_PX = 44;
const HANDOFF_DROP_PX = 26;
const STAMP_GAP_S = 0.42;
const LANE_INSET_PX = 20;

const canvasRef = ref(null);
const keyboardCanvasRef = ref(null);
const tileEls = [];
const grabbable = ref(false);

let renderer = null;
let scene = null;
let camera = null;
let box = null;
let physics = null;
let frameId = null;
let lastWidth = 0;
let lastHeight = 0;
let boxVisible = false;

const pose = { x: 0, y: 0, size: 0, ready: false };
const stampLevels = [];
let stampTimeline = null;
let stamped = false;
let shake = 0;
let spin = 0;
let lastDrop = 1;

let logoState = "boxed";
let captured = null;
let returnStart = 0;
let dragPointer = null;
let keyboard = null;
let keyboardRenderer = null;
let keyboardScene = null;
let stopKeystrokes = null;
let lastFrameAt = 0;
const { theme } = useTheme();

function cssVar(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function keyboardColors() {
  return {
    key: cssVar("--color-bg-button-default", "#1c2b3a"),
    accent: cssVar("--color-accent-variable", "#43d9ad"),
    case: cssVar("--color-border-white", "#1e2d3d"),
    screen: cssVar("--color-bg-field-default", "#011221"),
    text: cssVar("--color-white-gradient-01", "#e5e9f0"),
  };
}

watch(theme, () => requestAnimationFrame(() => keyboard?.setColors(keyboardColors())));

const _top = new Vector3();
const _corner = new Vector3();
const smooth = (t) => t * t * (3 - 2 * t);
const segment = (t, a, b) => smooth(progressBetween(t, a, b));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const lerpPose = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), size: lerp(a.size, b.size, t) });

function bounceOut(t) {
  const n = 7.5625;
  const d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
}

function anchorRect(name) {
  return document.querySelector(`[data-story-anchor="${name}"]`)?.getBoundingClientRect() ?? null;
}

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w === lastWidth && h === lastHeight) return;
  lastWidth = w;
  lastHeight = h;
  renderer.setSize(w, h);
  keyboardRenderer?.setSize(w, h);
  camera.left = -w / 2;
  camera.right = w / 2;
  camera.top = h / 2;
  camera.bottom = -h / 2;
  camera.updateProjectionMatrix();
  if (logoState === "spilled") setPhysicsBounds();
}

function init() {
  renderer = new WebGLRenderer({ canvas: canvasRef.value, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  scene = new Scene();
  camera = new OrthographicCamera(-1, 1, 1, -1, -2000, 2000);
  camera.position.set(0, 0, 1000);
  scene.add(new AmbientLight(0xffffff, 1.3));
  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(-0.8, 1.6, 1.4);
  scene.add(key);
  box = createCardboardBox();
  for (let i = 0; i < box.stampCount; i++) stampLevels.push(0);
  scene.add(box.group);
  keyboardRenderer = new WebGLRenderer({ canvas: keyboardCanvasRef.value, antialias: true, alpha: true });
  keyboardRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  keyboardScene = new Scene();
  keyboardScene.add(new AmbientLight(0xffffff, 1.3));
  const keyboardKey = new DirectionalLight(0xffffff, 2.2);
  keyboardKey.position.set(-0.8, 1.6, 1.4);
  keyboardScene.add(keyboardKey);
  keyboard = createKeyboard(keyboardColors());
  keyboardScene.add(keyboard.group);
  stopKeystrokes = onKeystroke((key) => keyboard.external(key, performance.now() / 1000));
  resize();
}

function layoutPoses(m, vw, vh) {
  const heroPanel = anchorRect("hero-panel");
  const dock = anchorRect("dock");
  const slot = anchorRect("slot");
  const contact = anchorRect("contact");
  if (!heroPanel || !dock || !slot || !contact) return null;
  const pinnedSlotBottom = (vh + slot.height) / 2;
  const small = clamp((vh - pinnedSlotBottom - 28) / 0.85, 80, 150);
  const big = clamp(slot.width * 0.42, 150, 240);
  const lane = vh - LANE_INSET_PX;
  const skySize = clamp((heroPanel.top - 40) / 0.9, 70, 130);
  return {
    sky: { x: heroPanel.left + heroPanel.width * 0.72, y: heroPanel.top - 24, size: skySize },
    start: { x: dock.left + small * 0.7, y: lane, size: small },
    laneEnd: { x: slot.left + slot.width / 2, y: lane, size: small },
    stack: { x: slot.left + slot.width / 2, y: slot.bottom - 6, size: big },
    conveyorStart: { x: vw * 0.1, y: lane, size: 96 },
    conveyorEnd: { x: vw * 0.9, y: lane, size: 96 },
    contact: { x: contact.left + contact.width / 2, y: contact.bottom - 10, size: clamp(contact.width * 0.7, 220, 380) },
    slot,
    big,
  };
}

function storyFrame(s, m, poses) {
  const vh = m.vh;
  const laneEnd = m.stackStart - vh * 0.15;
  if (s < m.projectsTop) {
    const d = progressBetween(s, m.heroTop, m.projectsTop);
    const target = {
      x: lerp(poses.sky.x, poses.start.x, smooth(d)),
      y: lerp(poses.sky.y, poses.start.y, bounceOut(d)),
      size: lerp(poses.sky.size, poses.start.size, smooth(d)),
    };
    return { target, open: 0, tape: 1, packing: 0, drop: d };
  }

  if (s < laneEnd) {
    const p = progressBetween(s, m.projectsTop, laneEnd);
    const target = lerpPose(poses.start, poses.laneEnd, smooth(p));
    return { target, open: segment(p, 0.35, 0.95), tape: 1 - segment(p, 0.1, 0.35), packing: 0, drop: 1 };
  }

  if (s <= m.pinEnd) {
    const q = progressBetween(s, laneEnd, m.stackStart);
    return { target: lerpPose(poses.laneEnd, poses.stack, smooth(q)), open: 1, tape: 0, packing: 0 };
  }

  if (s < m.experienceTop) {
    const u = progressBetween(s, m.pinEnd, m.experienceTop);
    const handoff = story.handoff
      ? { x: story.handoff.x, y: story.handoff.y + HANDOFF_DROP_PX, size: HANDOFF_SIZE_PX }
      : poses.conveyorStart;
    const target = lerpPose(poses.stack, handoff, segment(u, 0.15, 1));
    return { target, open: 1 - segment(u, 0.45, 0.7), tape: segment(u, 0.7, 0.85), packing: u };
  }

  if (s < m.experienceEnd) return null;

  if (s < m.contactEnter) {
    const v = progressBetween(s, m.experienceEnd, m.contactEnter);
    const target = lerpPose(poses.conveyorStart, poses.conveyorEnd, v);
    target.size *= segment(v, 0, 0.08);
    return { target, open: 0, tape: 1, packing: 1 };
  }

  const v = progressBetween(s, m.contactEnter, m.contactSettle);
  return { target: lerpPose(poses.conveyorEnd, poses.contact, smooth(v)), open: 0, tape: 1, packing: 1, contact: v };
}

function keyboardPose(s, m) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = clamp(vw * 0.16, 240, 320);
  const margin = width * 0.55;
  const mirror = { x: clamp(vw - pose.x, margin + 90, vw - margin), y: clamp(vh - pose.y + 40, 140, vh - 110) };
  const corner = { x: margin + 120, y: vh - 95 };
  const pinned = smooth(progressBetween(s, m.stackStart - vh * 0.5, m.stackStart)) * (1 - smooth(progressBetween(s, m.pinEnd, m.pinEnd + vh * 0.4)));
  return {
    x: lerp(mirror.x, corner.x, pinned),
    y: lerp(mirror.y, corner.y, pinned),
    width,
    form: s >= m.stackStart && s <= m.pinEnd,
    center: { x: vw * 0.84, y: vh * 0.22 },
    cell: clamp(vh * 0.032, 24, 34),
  };
}

function placeBoxAt(target, rotY, jolt) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = target.size / BOX.length;
  const halfHeight = scale * (0.5 * BOX.depth * Math.cos(TILT_X) + 0.5 * BOX.width * Math.sin(TILT_X));
  box.group.scale.setScalar(scale);
  box.group.rotation.set(TILT_X + jolt * 0.4, rotY, jolt);
  box.group.position.set(target.x - vw / 2, vh / 2 - target.y + halfHeight - Math.abs(jolt) * 120, 0);
  box.group.updateMatrixWorld();
}

function placeBox(t) {
  const jolt = shake * Math.sin(t * 60) * 0.05;
  const bob = { x: pose.x, y: pose.y + Math.sin(t * 1.4) * 6 * spin, size: pose.size };
  placeBoxAt(bob, BASE_ROT_Y + Math.sin(t * 0.6) * 0.06 + Math.sin(t * 0.45) * 0.9 * spin, jolt);
  shake *= 0.86;
}

function boxFloorScreen() {
  return toScreen(_corner.set(0, -BOX.depth / 2, BOX.width / 2));
}

function trackDrop(drop) {
  const landed = drop >= 0.97;
  if (landed && lastDrop < 0.97) {
    const floor = boxFloorScreen();
    pushImpulse(floor.x, floor.y, 1);
  }
  lastDrop = drop;
}

function toScreen(vec) {
  box.group.localToWorld(vec);
  return { x: vec.x + window.innerWidth / 2, y: window.innerHeight / 2 - vec.y };
}

function mouthScreen() {
  return toScreen(_top.set(0, BOX.depth / 2, 0));
}

function boxScreenBounds(target) {
  placeBoxAt(target, BASE_ROT_Y, 0);
  let minX = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const p = toScreen(_corner.set((sx * BOX.length) / 2, (sy * BOX.depth) / 2, (sz * BOX.width) / 2));
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
    }
  }
  const mouth = mouthScreen();
  placeBox(performance.now() / 1000);
  return { minX, maxX, maxY, mouth };
}

function setPhysicsBounds() {
  const poses = layoutPoses(story.markers, window.innerWidth, window.innerHeight);
  if (!poses || !physics) return null;
  const { slot, stack } = poses;
  const bounds = boxScreenBounds(stack);
  const floor = bounds.maxY - 4;
  const rimInset = (bounds.maxX - bounds.minX) * 0.06;
  physics.setBounds(
    { left: slot.left, right: window.innerWidth - 24, top: slot.top - 40, bottom: floor },
    {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.mouth.y + floor) / 2,
      width: bounds.maxX - bounds.minX - rimInset * 2,
      height: floor - bounds.mouth.y,
    },
  );
  return bounds.mouth;
}

function emergeScale(bornAt, now) {
  if (!bornAt) return 1;
  return Math.min(1, 0.35 + (0.65 * (now - bornAt)) / EMERGE_MS);
}

function styleTile(i, x, y, angle, scale, opacity) {
  const el = tileEls[i];
  if (!el) return;
  el.style.opacity = opacity;
  el.style.visibility = opacity > 0.01 ? "visible" : "hidden";
  el.style.transform = `translate3d(${x - TILE_PX / 2}px, ${y - TILE_PX / 2}px, 0) rotate(${angle}rad) scale(${scale})`;
}

function hideTiles() {
  STACK.forEach((_, i) => styleTile(i, 0, 0, 0, 1, 0));
}

function spillLogos() {
  if (!physics) return;
  const mouth = setPhysicsBounds();
  if (!mouth) return;
  physics.spill(STACK.length, TILE_PX, mouth);
  logoState = "spilled";
  captured = null;
  unlock("stack");
}

function updateLogos(s, m, frame, now) {
  const inStack = s >= m.stackStart && s <= m.pinEnd;
  grabbable.value = inStack && logoState === "spilled";

  if (inStack) {
    if (logoState === "boxed") spillLogos();
    if (logoState === "packed") logoState = "spilled";
    if (logoState === "returning") {
      physics.clear();
      logoState = "boxed";
      spillLogos();
    }
    physics?.step();
    physics?.snapshot().forEach((b, i) => styleTile(i, b.x, b.y, b.angle, emergeScale(b.bornAt, now), b.live ? 1 : 0));
    return;
  }

  if (s < m.stackStart) {
    if (logoState === "spilled" || logoState === "packed") {
      captured = physics.snapshot().map((b) => ({ ...b, y: b.y - (logoState === "packed" ? s - m.pinEnd : 0) }));
      physics.endDrag();
      returnStart = now;
      logoState = "returning";
    }
    if (logoState === "returning") {
      const k = smooth(Math.min(1, (now - returnStart) / RETURN_MS));
      const mouth = mouthScreen();
      captured.forEach((c, i) => {
        if (!c.live) return;
        styleTile(i, lerp(c.x, mouth.x, k), lerp(c.y, mouth.y, k), c.angle * (1 - k), 1 - 0.7 * k, k > 0.85 ? (1 - k) / 0.15 : 1);
      });
      if (k >= 1) {
        physics.clear();
        hideTiles();
        logoState = "boxed";
      }
    }
    return;
  }

  if (logoState === "returning") {
    physics.clear();
    hideTiles();
    logoState = "boxed";
  }
  if (logoState === "spilled") {
    captured = physics.snapshot();
    physics.endDrag();
    logoState = "packed";
  }
  if (logoState !== "packed" || !captured) return;
  physics.step();
  captured = physics.snapshot();
  const mouth = mouthScreen();
  const scrolledAway = s - m.pinEnd;
  captured.forEach((c, i) => {
    if (!c.live) return;
    const k = segment(frame.packing, 0.1 + i * 0.06, 0.22 + i * 0.06);
    const startY = c.y - scrolledAway;
    styleTile(i, lerp(c.x, mouth.x, k), lerp(startY, mouth.y, k), c.angle * (1 - k), 1 - 0.75 * k, k > 0.9 ? (1 - k) / 0.1 : 1);
  });
}

function playStamps() {
  stamped = true;
  stampTimeline?.kill();
  stampTimeline = gsap.timeline();
  stampLevels.forEach((_, i) => {
    const level = { value: 0 };
    stampTimeline.to(level, {
      value: 1,
      duration: 0.16,
      ease: "power3.in",
      onUpdate: () => { stampLevels[i] = level.value; },
      onComplete: () => {
        shake = 1;
        const floor = boxFloorScreen();
        pushImpulse(floor.x, floor.y, 0.6);
      },
    }, 0.15 + i * STAMP_GAP_S);
  });
  stampTimeline.add(() => {
    contactRevealed.value = true;
    unlock("shipped");
  }, "+=0.25");
}

function resetStamps() {
  stamped = false;
  stampTimeline?.kill();
  stampLevels.fill(0);
}

function updateStamps(frame, s, m) {
  if (frame?.contact === undefined) {
    if (stamped && s < m.contactEnter) resetStamps();
    return;
  }
  if (!stamped && (frame.contact >= 0.97 || s >= m.maxScroll - 2)) playStamps();
}

function tick(now) {
  frameId = requestAnimationFrame(tick);
  resize();
  const m = story.markers;
  const t = now / 1000;
  if (!m) {
    contactRevealed.value = true;
    if (boxVisible) {
      renderer.clear();
      keyboardRenderer.clear();
    }
    boxVisible = false;
    return;
  }

  const s = window.scrollY;
  const poses = layoutPoses(m, window.innerWidth, window.innerHeight);
  const frame = poses ? storyFrame(s, m, poses) : null;

  if (!frame) {
    if (boxVisible) {
      renderer.clear();
      keyboardRenderer.clear();
    }
    boxVisible = false;
    pose.ready = false;
    if (logoState !== "boxed") {
      physics?.clear();
      hideTiles();
      logoState = "boxed";
    }
    return;
  }

  if (!pose.ready) {
    Object.assign(pose, frame.target, { ready: true });
  } else {
    pose.x = lerp(pose.x, frame.target.x, POSE_EASE);
    pose.y = lerp(pose.y, frame.target.y, POSE_EASE);
    pose.size = lerp(pose.size, frame.target.size, POSE_EASE);
  }

  spin = lerp(spin, 1 - (frame.drop ?? 1), 0.12);
  box.setOpen(frame.open);
  box.setTape(frame.tape);
  updateStamps(frame, s, m);
  stampLevels.forEach((level, i) => box.setStamp(i, level));
  placeBox(t);
  keyboard.update({
    ...keyboardPose(s, m),
    vw: window.innerWidth,
    vh: window.innerHeight,
    time: t,
    dt: Math.min(0.05, t - lastFrameAt),
  });
  lastFrameAt = t;
  trackDrop(frame.drop ?? 1);
  updateLogos(s, m, frame, now);

  renderer.render(scene, camera);
  keyboardRenderer.render(keyboardScene, camera);
  boxVisible = true;
}

function pointerPoint(e) {
  return { x: e.clientX, y: e.clientY };
}

function onPointerDown(e, index) {
  if (!grabbable.value || !physics) return;
  dragPointer = e.pointerId;
  physics.startDrag(index, pointerPoint(e));
}

function onPointerMove(e) {
  if (dragPointer !== e.pointerId) return;
  physics?.moveDrag(pointerPoint(e));
}

function onPointerUp(e) {
  if (dragPointer !== e.pointerId) return;
  dragPointer = null;
  physics?.endDrag();
}

onMounted(async () => {
  contactRevealed.value = false;
  init();
  hideTiles();
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  frameId = requestAnimationFrame(tick);
  physics = await createStackPhysics();
});

onUnmounted(() => {
  cancelAnimationFrame(frameId);
  stampTimeline?.kill();
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  window.removeEventListener("pointercancel", onPointerUp);
  physics?.dispose();
  box?.dispose();
  stopKeystrokes?.();
  keyboard?.dispose();
  renderer?.dispose();
  keyboardRenderer?.dispose();
  contactRevealed.value = true;
});
</script>

<style scoped>
.keyboard-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
}

.box-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1;
}

.logo-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 20;
  overflow: hidden;
}

.logo-body {
  position: absolute;
  left: 0;
  top: 0;
  visibility: hidden;
  opacity: 0;
  will-change: transform;
  touch-action: none;
}

.logo-body--grabbable {
  pointer-events: auto;
  cursor: grab;
}

.logo-body--grabbable:active {
  cursor: grabbing;
}
</style>
