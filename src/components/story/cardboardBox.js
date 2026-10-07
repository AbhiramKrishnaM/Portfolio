import {
  CanvasTexture,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const BOX = {
  width: 40,
  length: 56,
  depth: 36,
  thickness: 0.6,
  fluteFreq: 5,
  flapGap: 1,
};

const CARDBOARD_COLOR = 0xb08d62;
const INK_COLOR = "#2b2218";
const STAMP_RED = "#b3261e";
const LABEL_PAPER = "#f4efe6";
const TAPE_COLOR = 0xc9a978;
const OPEN_SPLAY = 0.22 * Math.PI;
const CLOSED_TOP = { width: 0.6 * Math.PI, backLength: 0.5 * Math.PI, frontLength: 0.49 * Math.PI };
const CLOSED_BOTTOM = { width: 0.6 * Math.PI, backLength: 0.5 * Math.PI, frontLength: 0.49 * Math.PI };
const TEXTURE_SCALE = 12;

const smooth = (t) => t * t * (3 - 2 * t);
const segment = (t, start, end) => smooth(Math.min(1, Math.max(0, (t - start) / (end - start))));
const mix = (a, b, t) => a + (b - a) * t;

function layerGeometry(base, size, folds, offset) {
  const geometry = base.clone();
  const pos = geometry.attributes.position;
  const foldModifier = (c, s) => 1 - Math.pow(c / (0.5 * s), 10);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    let z = pos.getZ(i) + offset(x);
    if ((x > 0 && folds[1]) || (x < 0 && folds[3])) z *= foldModifier(x, size[0]);
    if ((y > 0 && folds[0]) || (y < 0 && folds[2])) z *= foldModifier(y, size[1]);
    pos.setXYZ(i, x, y, z);
  }
  return geometry;
}

function panelGeometry(width, height, folds, hasMiddleLayer) {
  const base = new PlaneGeometry(width, height, Math.floor(3 * width), Math.max(1, Math.floor(0.2 * height)));
  const { thickness, fluteFreq } = BOX;
  const layers = [
    layerGeometry(base, [width, height], folds, (v) => -0.5 * thickness + 0.01 * Math.sin(fluteFreq * v)),
    layerGeometry(base, [width, height], folds, (v) => 0.5 * thickness + 0.01 * Math.sin(fluteFreq * v)),
  ];
  if (hasMiddleLayer) {
    layers.push(layerGeometry(base, [width, height], folds, (v) => 0.5 * thickness * Math.sin(fluteFreq * v)));
  }
  const merged = mergeGeometries(layers, false);
  merged.computeVertexNormals();
  base.dispose();
  layers.forEach((g) => g.dispose());
  return merged;
}

function canvasPlane(width, height, paint) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * TEXTURE_SCALE);
  canvas.height = Math.round(height * TEXTURE_SCALE);
  const ctx = canvas.getContext("2d");
  paint(ctx, canvas.width, canvas.height);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
  return new Mesh(new PlaneGeometry(width, height), material);
}

function stampText(ctx, w, h, lines, color, boxed) {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  if (boxed) {
    ctx.lineWidth = h * 0.08;
    ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2);
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const size = (h * 0.62) / lines.length;
  ctx.font = `700 ${size}px "Fira Code", monospace`;
  lines.forEach((line, i) => ctx.fillText(line, w / 2, (h / (lines.length + 1)) * (i + 1)));
}

function createLabel() {
  return canvasPlane(40, 10, (ctx, w, h) => {
    ctx.fillStyle = INK_COLOR;
    ctx.textBaseline = "middle";
    ctx.font = `700 ${h * 0.5}px "Fira Code", monospace`;
    ctx.fillText("node_modules", w * 0.02, h * 0.36);
    ctx.font = `500 ${h * 0.2}px "Fira Code", monospace`;
    ctx.fillText("↑↑ THIS SIDE UP", w * 0.02, h * 0.84);
  });
}

function createShippingLabel() {
  return canvasPlane(30, 16, (ctx, w, h) => {
    ctx.fillStyle = LABEL_PAPER;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = INK_COLOR;
    ctx.lineWidth = h * 0.02;
    ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2);
    ctx.fillStyle = INK_COLOR;
    ctx.textBaseline = "middle";
    const rows = [
      ["FROM:", "abhiram@portfolio"],
      ["TO:", "you"],
      ["INSIDE:", "ideas, code, coffee"],
    ];
    const size = h * 0.11;
    rows.forEach(([key, value], i) => {
      const y = h * (0.25 + i * 0.25);
      ctx.font = `700 ${size}px "Fira Code", monospace`;
      ctx.fillText(key, w * 0.05, y);
      ctx.font = `400 ${size}px "Fira Code", monospace`;
      ctx.fillText(value, w * 0.3, y);
    });
  });
}

function createStamps(front) {
  const surface = BOX.thickness / 2 + 0.35;
  const specs = [
    { mesh: canvasPlane(15, 6, (ctx, w, h) => stampText(ctx, w, h, ["FRAGILE"], STAMP_RED, true)), x: 19, y: 12, rot: 0.1 },
    { mesh: createShippingLabel(), x: 12, y: -6, rot: 0.03 },
    { mesh: canvasPlane(22, 8, (ctx, w, h) => stampText(ctx, w, h, ["SHIPPED"], STAMP_RED, true)), x: -15, y: -6, rot: -0.2 },
  ];
  return specs.map((spec, i) => {
    spec.mesh.position.set(spec.x, spec.y, surface + 0.05 * (i + 1));
    spec.mesh.renderOrder = 2 + i;
    spec.mesh.rotation.z = spec.rot;
    spec.mesh.material.opacity = 0;
    spec.mesh.visible = false;
    front.add(spec.mesh);
    return spec.mesh;
  });
}

export function createCardboardBox() {
  const group = new Group();
  const material = new MeshStandardMaterial({ color: CARDBOARD_COLOR, roughness: 0.92, metalness: 0, side: DoubleSide });
  const halves = {};

  for (const half of ["backHalf", "frontHalf"]) {
    halves[half] = {};
    for (const side of ["width", "length"]) {
      const sideWidth = side === "width" ? BOX.width : BOX.length;
      const flapWidth = sideWidth - 2 * BOX.flapGap;
      const flapHeight = 0.5 * BOX.width - 0.75 * BOX.flapGap;

      const sideMesh = new Mesh(panelGeometry(sideWidth, BOX.depth, [true, true, true, true], false), material);
      const topGeometry = panelGeometry(flapWidth, flapHeight, [false, false, true, false], true);
      const bottomGeometry = panelGeometry(flapWidth, flapHeight, [true, false, false, false], true);
      topGeometry.translate(0, 0.5 * flapHeight, 0);
      bottomGeometry.translate(0, -0.5 * flapHeight, 0);
      const top = new Mesh(topGeometry, material);
      const bottom = new Mesh(bottomGeometry, material);
      top.position.y = 0.5 * BOX.depth;
      bottom.position.y = -0.5 * BOX.depth;
      sideMesh.add(top, bottom);
      group.add(sideMesh);
      halves[half][side] = { side: sideMesh, top, bottom };
    }
  }

  const opening = 0.5 * Math.PI;
  const cos = Math.cos(opening);
  const sin = Math.sin(opening);
  halves.frontHalf.width.side.position.x = 0.5 * BOX.length;
  halves.backHalf.width.side.position.x = -0.5 * BOX.length;
  halves.frontHalf.width.side.rotation.y = opening;
  halves.backHalf.width.side.rotation.y = opening;
  halves.frontHalf.length.side.position.set(-0.5 * cos * BOX.width, 0, 0.5 * sin * BOX.width);
  halves.backHalf.length.side.position.set(0.5 * cos * BOX.width, 0, -0.5 * sin * BOX.width);

  halves.frontHalf.width.bottom.rotation.x = CLOSED_BOTTOM.width;
  halves.backHalf.width.bottom.rotation.x = -CLOSED_BOTTOM.width;
  halves.backHalf.length.bottom.rotation.x = -CLOSED_BOTTOM.backLength;
  halves.frontHalf.length.bottom.rotation.x = CLOSED_BOTTOM.frontLength;

  const front = halves.frontHalf.length.side;
  const label = createLabel();
  label.position.set(-6, 11, BOX.thickness / 2 + 0.3);
  label.renderOrder = 1;
  front.add(label);

  const tapeGeometry = new PlaneGeometry(BOX.length * 0.92, 7);
  tapeGeometry.translate(BOX.length * 0.46, 0, 0);
  const tape = new Mesh(tapeGeometry, new MeshStandardMaterial({ color: TAPE_COLOR, roughness: 0.4, transparent: true, opacity: 0.92 }));
  tape.rotation.x = -Math.PI / 2;
  tape.position.set(-BOX.length * 0.46, 0.5 * BOX.depth + 1.7, 0);
  group.add(tape);

  const stamps = createStamps(front);

  function setOpen(amount) {
    const close = 1 - amount;
    const widthAngle = mix(-OPEN_SPLAY, CLOSED_TOP.width, segment(close, 0, 0.5));
    const backAngle = mix(-OPEN_SPLAY, CLOSED_TOP.backLength, segment(close, 0.3, 0.8));
    const frontAngle = mix(-OPEN_SPLAY, CLOSED_TOP.frontLength, segment(close, 0.5, 1));
    halves.frontHalf.width.top.rotation.x = -widthAngle;
    halves.backHalf.width.top.rotation.x = widthAngle;
    halves.backHalf.length.top.rotation.x = backAngle;
    halves.frontHalf.length.top.rotation.x = -frontAngle;
  }

  function setTape(amount) {
    tape.visible = amount > 0.001;
    tape.scale.x = Math.max(0.001, amount);
  }

  function setStamp(index, amount) {
    const mesh = stamps[index];
    mesh.visible = amount > 0.001;
    mesh.material.opacity = Math.min(1, amount) * 0.95;
    const scale = 1 + (1 - Math.min(1, amount)) * 0.8;
    mesh.scale.set(scale, scale, 1);
  }

  function dispose() {
    group.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.geometry.dispose();
      obj.material.map?.dispose();
      obj.material.dispose();
    });
  }

  setOpen(0);
  setTape(1);

  return { group, setOpen, setTape, setStamp, stampCount: stamps.length, dispose };
}
