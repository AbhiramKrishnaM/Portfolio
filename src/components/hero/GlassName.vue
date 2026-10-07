<template>
  <canvas ref="canvasRef" class="glass-name" aria-hidden="true" />
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import {
  CanvasTexture,
  Color,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";
import { useTheme } from "@/composables/useTheme.js";

const props = defineProps({
  target: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["ready"]);

const LENS_PX = 78;
const PAD_PX = LENS_PX + 8;
const RADIUS_EASE = 0.16;
const FOLLOW_EASE = 0.3;
const FLIP_TRACK_MS = 700;

const vertexShader = `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uText;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uRadius;
  uniform float uDpr;
  uniform vec3 uInk;
  uniform vec3 uRim;

  void main() {
    vec2 p = gl_FragCoord.xy;
    vec2 d = p - uMouse;
    float r = length(d);
    float k = r / max(uRadius, 1.0);
    float inside = uRadius > 0.5 ? 1.0 - smoothstep(0.95, 1.0, k) : 0.0;
    float lens = inside * (1.0 - k * k);
    vec2 dir = r > 0.0 ? d / r : vec2(0.0);
    vec2 sp = mix(p, uMouse + d * 0.6, lens);
    float split = 1.5 * uDpr * lens + 0.7 * uDpr * inside * smoothstep(0.6, 1.0, k);

    vec3 a = vec3(
      texture2D(uText, (sp + dir * split) / uRes).a,
      texture2D(uText, sp / uRes).a,
      texture2D(uText, (sp - dir * split) / uRes).a
    );
    float textAlpha = max(a.r, max(a.g, a.b));
    vec3 text = uInk * a;

    float rim = inside * smoothstep(0.84, 0.97, k);
    float spot = inside * smoothstep(0.42, 0.0, length(d / max(uRadius, 1.0) - vec2(-0.38, 0.42)));
    float glassAlpha = inside * 0.045 + rim * 0.32 + spot * 0.1;
    vec3 glass = mix(vec3(1.0), uRim, rim / max(rim + spot, 0.001));

    vec3 color = text + glass * glassAlpha * (1.0 - textAlpha);
    float alpha = textAlpha + glassAlpha * (1.0 - textAlpha);
    gl_FragColor = vec4(color, alpha);
  }
`;

const canvasRef = ref(null);
const { theme } = useTheme();

let renderer = null;
let scene = null;
let camera = null;
let material = null;
let texture = null;
let textCanvas = null;
let frameId = null;
let resizeObserver = null;
let dirty = true;
let trackFlipUntil = 0;
let lastRadius = 0;
const pointer = { x: 0, y: 0, active: false };
const lens = { x: 0, y: 0, radius: 0 };

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function canvasRect() {
  return canvasRef.value.getBoundingClientRect();
}

function charRects(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const chars = [];
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent;
    for (let i = 0; i < text.length; i++) {
      if (!text[i].trim()) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const rect = range.getBoundingClientRect();
      if (!rect.width) continue;
      chars.push({ char: text[i], rect, el: node.parentElement });
    }
  }
  range.detach();
  return chars;
}

function rotationOf(el) {
  if (el === props.target) return 0;
  const matrix = getComputedStyle(el).transform;
  if (!matrix || matrix === "none") return 0;
  const values = matrix.match(/matrix\(([^)]+)\)/)?.[1].split(",").map(Number);
  return values ? Math.atan2(values[1], values[0]) : 0;
}

function drawText() {
  const h1 = props.target;
  const dpr = renderer.getPixelRatio();
  const rect = canvasRect();
  const width = Math.round(rect.width * dpr);
  const height = Math.round(rect.height * dpr);
  if (textCanvas.width !== width || textCanvas.height !== height) {
    textCanvas.width = width;
    textCanvas.height = height;
    texture?.dispose();
    texture = createTexture();
    material.uniforms.uText.value = texture;
  }
  const ctx = textCanvas.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.scale(dpr, dpr);
  const style = getComputedStyle(h1);
  ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";
  for (const { char, rect: r, el } of charRects(h1)) {
    const metrics = ctx.measureText(char);
    const ascent = metrics.fontBoundingBoxAscent;
    const descent = metrics.fontBoundingBoxDescent;
    const offsetY = (r.height - (ascent + descent)) / 2 + ascent;
    const angle = rotationOf(el);
    if (angle) {
      ctx.save();
      ctx.translate(r.left - rect.left + r.width / 2, r.top - rect.top + r.height / 2);
      ctx.rotate(angle);
      ctx.fillText(char, -r.width / 2, -r.height / 2 + offsetY);
      ctx.restore();
    } else {
      ctx.fillText(char, r.left - rect.left, r.top - rect.top + offsetY);
    }
  }
  texture.needsUpdate = true;
}

function resize() {
  const h1 = props.target;
  const canvas = canvasRef.value;
  canvas.style.left = `${h1.offsetLeft - PAD_PX}px`;
  canvas.style.top = `${h1.offsetTop - PAD_PX}px`;
  canvas.style.width = `${h1.offsetWidth + PAD_PX * 2}px`;
  canvas.style.height = `${h1.offsetHeight + PAD_PX * 2}px`;
  const rect = canvasRect();
  renderer.setSize(rect.width, rect.height, false);
  const dpr = renderer.getPixelRatio();
  material.uniforms.uRes.value.set(rect.width * dpr, rect.height * dpr);
  material.uniforms.uDpr.value = dpr;
  dirty = true;
}

function applyColors() {
  if (!material) return;
  material.uniforms.uInk.value.set(cssVar("--color-white-gradient-01") || "#e5e9f0");
  material.uniforms.uRim.value.set(cssVar("--color-accent-variable") || "#43d9ad");
  dirty = true;
}

function onPointerMove(e) {
  const h1 = props.target.getBoundingClientRect();
  const margin = 24;
  pointer.active = e.clientX > h1.left - margin && e.clientX < h1.right + margin &&
    e.clientY > h1.top - margin && e.clientY < h1.bottom + margin;
  const rect = canvasRect();
  pointer.x = e.clientX - rect.left;
  pointer.y = rect.bottom - e.clientY;
}

function onPointerLeave() {
  pointer.active = false;
}

function tick(now) {
  frameId = requestAnimationFrame(tick);
  const targetRadius = pointer.active ? LENS_PX : 0;
  lens.radius += (targetRadius - lens.radius) * RADIUS_EASE;
  if (lens.radius < 0.3 && targetRadius === 0) lens.radius = 0;
  if (lens.radius === 0) {
    lens.x = pointer.x;
    lens.y = pointer.y;
  } else {
    lens.x += (pointer.x - lens.x) * FOLLOW_EASE;
    lens.y += (pointer.y - lens.y) * FOLLOW_EASE;
  }

  const tracking = now < trackFlipUntil;
  if (tracking) dirty = true;
  const lensVisible = lens.radius > 0 || lastRadius > 0;
  if (!dirty && !lensVisible) return;

  if (dirty) {
    drawText();
    dirty = false;
  }
  const dpr = renderer.getPixelRatio();
  material.uniforms.uMouse.value.set(lens.x * dpr, lens.y * dpr);
  material.uniforms.uRadius.value = lens.radius * dpr;
  renderer.render(scene, camera);
  lastRadius = lens.radius;
}

function createTexture() {
  const tex = new CanvasTexture(textCanvas);
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

function init() {
  renderer = new WebGLRenderer({ canvas: canvasRef.value, alpha: true, antialias: false, premultipliedAlpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  scene = new Scene();
  camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  textCanvas = document.createElement("canvas");
  texture = createTexture();
  material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uText: { value: texture },
      uRes: { value: new Vector2(1, 1) },
      uMouse: { value: new Vector2(0, 0) },
      uRadius: { value: 0 },
      uDpr: { value: 1 },
      uInk: { value: new Color() },
      uRim: { value: new Color() },
    },
  });
  const quad = new Mesh(new PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  scene.add(quad);
}

watch(theme, () => {
  trackFlipUntil = performance.now() + FLIP_TRACK_MS;
  requestAnimationFrame(applyColors);
});

onMounted(async () => {
  if (!props.target) return;
  await (document.fonts?.ready ?? Promise.resolve());
  try {
    init();
  } catch {
    emit("ready", false);
    return;
  }
  resize();
  applyColors();
  drawText();
  renderer.render(scene, camera);
  dirty = false;
  emit("ready", true);
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(props.target);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);
  canvasRef.value.addEventListener("webglcontextlost", () => emit("ready", false));
  frameId = requestAnimationFrame(tick);
});

onUnmounted(() => {
  emit("ready", false);
  cancelAnimationFrame(frameId);
  resizeObserver?.disconnect();
  window.removeEventListener("pointermove", onPointerMove);
  document.documentElement.removeEventListener("pointerleave", onPointerLeave);
  texture?.dispose();
  material?.dispose();
  renderer?.dispose();
});
</script>

<style scoped>
.glass-name {
  position: absolute;
  pointer-events: none;
  z-index: 1;
}
</style>
