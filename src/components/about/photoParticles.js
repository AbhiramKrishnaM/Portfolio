import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

const SAMPLE_SIZE = 170;
const LEVEL_LOW = 0.05;
const LEVEL_HIGH = 0.97;
const CONTRAST = 1.15;
const ALPHA_CUTOFF = 0.5;
const REPEL_RADIUS = 0.16;
const REPEL_FORCE = 0.0045;
const SPRING = 0.045;
const DAMPING = 0.86;
const SHIMMER = 0.0016;

const vertexShader = `
  attribute float aBright;
  attribute float aSeed;
  uniform float uSize;
  uniform float uTime;
  varying float vBright;
  void main() {
    vBright = aBright;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (0.45 + aBright * 0.9) * (0.9 + 0.1 * sin(uTime * 2.0 + aSeed * 6.2831));
  }
`;

const fragmentShader = `
  uniform vec3 uDim;
  uniform vec3 uLit;
  uniform float uOpacity;
  varying float vBright;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float edge = smoothstep(0.5, 0.2, d);
    vec3 col = mix(uDim, uLit, vBright);
    gl_FragColor = vec4(col, edge * uOpacity * (0.18 + vBright * 0.82));
  }
`;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function samplePortrait(src) {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const pixels = [];
  for (let y = 0; y < SAMPLE_SIZE; y++) {
    for (let x = 0; x < SAMPLE_SIZE; x++) {
      const o = (y * SAMPLE_SIZE + x) * 4;
      if (data[o + 3] / 255 < ALPHA_CUTOFF) continue;
      pixels.push([x, y, (0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]) / 255]);
    }
  }
  const sorted = pixels.map((px) => px[2]).sort((a, b) => a - b);
  const low = sorted[Math.floor(sorted.length * LEVEL_LOW)];
  const high = sorted[Math.floor(sorted.length * LEVEL_HIGH)];
  const points = [];
  for (const [x, y, lum] of pixels) {
    const t = Math.min(1, Math.max(0, (lum - low) / Math.max(0.001, high - low)));
    const level = t * t * (3 - 2 * t);
    if (level < 0.08 && (x + y) % 2) continue;
    points.push(x / SAMPLE_SIZE - 0.5, 0.5 - y / SAMPLE_SIZE, Math.pow(level, CONTRAST));
  }
  return points;
}

export async function createPhotoParticles(canvas, src) {
  const sampled = await samplePortrait(src);
  const count = sampled.length / 3;
  const home = new Float32Array(count * 2);
  const positions = new Float32Array(count * 3);
  const velocity = new Float32Array(count * 2);
  const bright = new Float32Array(count);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    home[i * 2] = sampled[i * 3];
    home[i * 2 + 1] = sampled[i * 3 + 1];
    positions[i * 3] = home[i * 2] + (Math.random() - 0.5) * 0.6;
    positions[i * 3 + 1] = home[i * 2 + 1] + (Math.random() - 0.5) * 0.6;
    bright[i] = sampled[i * 3 + 2];
    seed[i] = Math.random();
  }

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 1);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aBright", new BufferAttribute(bright, 1));
  geometry.setAttribute("aSeed", new BufferAttribute(seed, 1));
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uSize: { value: 3 },
      uTime: { value: 0 },
      uDim: { value: new Color() },
      uLit: { value: new Color() },
      uOpacity: { value: 1 },
    },
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const pointer = { x: 0, y: 0, active: false };

  function resize(width, height) {
    renderer.setSize(width, height, false);
    material.uniforms.uSize.value = (width / SAMPLE_SIZE) * 1.15 * renderer.getPixelRatio();
  }

  function setPointer(x, y, active) {
    pointer.x = x - 0.5;
    pointer.y = 0.5 - y;
    pointer.active = active;
  }

  function setColors({ dim, lit, additive }) {
    material.uniforms.uDim.value.set(dim);
    material.uniforms.uLit.value.set(lit);
    material.blending = additive ? AdditiveBlending : NormalBlending;
    material.needsUpdate = true;
  }

  function step(time, animate) {
    material.uniforms.uTime.value = time;
    for (let i = 0; i < count; i++) {
      const p = i * 3;
      const h = i * 2;
      let vx = velocity[h];
      let vy = velocity[h + 1];
      const px = positions[p];
      const py = positions[p + 1];
      if (pointer.active && animate) {
        const dx = px - pointer.x;
        const dy = py - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < REPEL_RADIUS * REPEL_RADIUS && d2 > 1e-6) {
          const d = Math.sqrt(d2);
          const push = (1 - d / REPEL_RADIUS) * REPEL_FORCE / d;
          vx += dx * push;
          vy += dy * push;
        }
      }
      const shimmer = animate ? SHIMMER * Math.sin(time * 1.3 + seed[i] * 40) : 0;
      vx += (home[h] + shimmer - px) * SPRING;
      vy += (home[h + 1] + shimmer * 0.6 - py) * SPRING;
      vx *= DAMPING;
      vy *= DAMPING;
      velocity[h] = vx;
      velocity[h + 1] = vy;
      positions[p] = px + vx;
      positions[p + 1] = py + vy;
    }
    geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }

  function dispose() {
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  }

  return { resize, setPointer, setColors, step, dispose, count };
}
