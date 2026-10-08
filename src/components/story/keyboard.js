import {
  Box3,
  BoxGeometry,
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  SRGBColorSpace,
  Vector3,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const MODEL_URL = "/models/keyboard.glb";
const MODEL_CENTER = [3.85, 0, -14];
const MODEL_WIDTH = 31;
const CASE_NODE = "Cube.062";
const PLATE_NODE = "Cube.040";

const ROWS = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
  ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["CapsLock", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
  ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "ShiftRight"],
  ["Control", "Alt", " ", "AltRight", "Meta", "Fn", "ControlRight"],
];
const ACCENT_KEYS = new Set(["`", "Enter", " "]);
const SHIFTED = {
  "~": "`", "!": "1", "@": "2", "#": "3", "$": "4", "%": "5", "^": "6", "&": "7", "*": "8", "(": "9", ")": "0",
  "_": "-", "+": "=", "{": "[", "}": "]", "|": "\\", ":": ";", "\"": "'", "<": ",", ">": ".", "?": "/",
};

const PRESS_DEPTH = 0.5;
const PRESS_DECAY = 9;
const SCREEN_CHARS = 26;
const IDLE_AFTER_S = 6;
const IDLE_TYPE_S = 0.11;
const IDLE_PHRASES = ["npm run dev", "git push origin main", "hello, world", "sudo make coffee", "ls node_modules", "vim portfolio.vue"];
const UNIT_MAX_WIDTH = 2.3;
const FORM_SPEED = 1.3;
const FORM_STAGGER = 0.45;
const FORM_FOLLOW = 9;
const FORM_DEPTH = -700;
const FORM_DIM_OPACITY = 0.6;
const GLYPH_HOLD_S = 1.8;
const GLYPHS = {
  "#": ["01010", "01010", "11111", "01010", "11111", "01010", "01010"],
  "@": ["01110", "10001", "10111", "10101", "10111", "10000", "01111"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "$": ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  "*": ["00000", "00100", "10101", "01110", "10101", "00100", "00000"],
  "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
};
const GLYPH_KEYS = Object.keys(GLYPHS);
const FACE_CAMERA = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);

function glyphCells(char) {
  const cells = [];
  GLYPHS[char].forEach((row, r) => {
    [...row].forEach((bit, c) => {
      if (bit === "1") cells.push([c - 2, 3 - r]);
    });
  });
  return cells;
}

const smooth = (t) => t * t * (3 - 2 * t);

function drawScreen(ctx, text, cursorOn, colors, flash) {
  const { width: w, height: h } = ctx.canvas;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = colors.screen;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = colors.accent;
  ctx.globalAlpha = 0.5 + flash * 0.5;
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, w - 6, h - 6);
  ctx.globalAlpha = 1;
  ctx.font = `500 ${h * 0.46}px "Fira Code", monospace`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = colors.accent;
  ctx.fillText("$", w * 0.035, h * 0.52);
  ctx.fillStyle = colors.text;
  const shown = text.slice(-SCREEN_CHARS);
  ctx.fillText(shown, w * 0.1, h * 0.52);
  if (cursorOn) {
    const x = w * 0.1 + ctx.measureText(shown).width + 4;
    ctx.fillStyle = colors.accent;
    ctx.fillRect(x, h * 0.28, h * 0.22, h * 0.48);
  }
}

export function createKeyboard(colors) {
  const group = new Group();
  const pivot = new Group();
  group.add(pivot);
  group.visible = false;

  const materials = {
    key: new MeshStandardMaterial({ roughness: 0.6, metalness: 0.05 }),
    accent: new MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 }),
    case: new MeshStandardMaterial({ roughness: 0.5, metalness: 0.2 }),
    accentDim: new MeshStandardMaterial({ roughness: 0.55, metalness: 0.05, transparent: true, opacity: FORM_DIM_OPACITY }),
  };
  const units = [];
  let formT = 0;
  let glyph = "#";
  let glyphAt = 0;
  const keys = new Map();
  const pressable = [];
  let ready = false;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  const screenTexture = new CanvasTexture(canvas);
  screenTexture.colorSpace = SRGBColorSpace;
  const screen = new Group();
  const bezel = new Mesh(new BoxGeometry(22.6, 3.9, 0.6), materials.case);
  const panel = new Mesh(new PlaneGeometry(21.6, 3.375), new MeshBasicMaterial({ map: screenTexture }));
  panel.position.z = 0.31;
  const stand = new Mesh(new BoxGeometry(6, 2.2, 0.5), materials.case);
  stand.position.set(0, -2.2, -0.15);
  screen.add(bezel, panel, stand);
  screen.position.set(0, 4.4, -7.2);
  screen.rotation.x = -0.18;
  pivot.add(screen);

  let text = "";
  let lastKeyAt = -Infinity;
  let flashAt = -Infinity;
  let dirty = true;
  let lastCursor = null;
  let idle = null;
  let pendingClear = null;
  let palette = { ...colors };

  function applyColors(next) {
    palette = { ...palette, ...next };
    materials.key.color.set(palette.key);
    materials.accent.color.set(palette.accent);
    materials.case.color.set(palette.case);
    materials.accentDim.color.set(palette.accent);
    dirty = true;
  }
  applyColors(colors);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(MODEL_URL, (gltf) => {
    const model = gltf.scene;
    model.updateMatrixWorld(true);
    const widths = new Map(model.children.map((node) => {
      const size = new Box3().setFromObject(node).getSize(new Vector3());
      return [node, size.z];
    }));
    model.rotation.y = -Math.PI / 2;
    model.position.set(MODEL_CENTER[2], 0, -MODEL_CENTER[0]);
    const rows = new Map();
    const paint = (node, material) => node.traverse((child) => {
      if (child.isMesh) child.material = material;
    });
    model.children.forEach((node) => {
      if (node.name === CASE_NODE || node.name === PLATE_NODE) {
        paint(node, materials.case);
        return;
      }
      const row = Math.round(node.position.x / 2);
      if (!rows.has(row)) rows.set(row, []);
      rows.get(row).push(node);
    });
    [...rows.keys()].sort((a, b) => a - b).forEach((row, r) => {
      const nodes = rows.get(row).sort((a, b) => b.position.z - a.position.z);
      nodes.forEach((node, c) => {
        const label = ROWS[r]?.[c];
        const accent = ACCENT_KEYS.has(label);
        paint(node, accent ? materials.accent : materials.key);
        const entry = { node, restY: node.position.y, press: 0 };
        pressable.push(entry);
        if (widths.get(node) <= UNIT_MAX_WIDTH) {
          units.push({
            node,
            accent,
            dimmed: null,
            restPos: node.position.clone(),
            restQuat: node.quaternion.clone(),
            restScale: node.scale.clone(),
            formPos: null,
            stagger: Math.random(),
          });
        }
        if (label) keys.set(label, entry);
      });
    });
    pivot.add(model);
    units.sort(() => Math.random() - 0.5);
    ready = true;
  });

  function pressKey(label) {
    const entry = keys.get(label);
    if (entry) entry.press = 1;
  }

  function press(key, time) {
    lastKeyAt = time;
    if (key === "Enter") {
      pressKey("Enter");
      flashAt = time;
      pendingClear = time + 0.6;
    } else if (key === "Backspace") {
      pressKey("Backspace");
      text = text.slice(0, -1);
    } else if (key.length === 1) {
      if (pendingClear !== null) {
        text = "";
        pendingClear = null;
      }
      const lower = key.toLowerCase();
      if (SHIFTED[key]) {
        pressKey("Shift");
        pressKey(SHIFTED[key]);
      } else {
        if (key !== lower) pressKey("Shift");
        pressKey(lower);
      }
      text += key;
    } else {
      pressKey(key);
    }
    dirty = true;
  }

  function stepIdle(time) {
    if (time - lastKeyAt < IDLE_AFTER_S && !idle) return;
    if (!idle) {
      idle = { phrase: IDLE_PHRASES[Math.floor(Math.random() * IDLE_PHRASES.length)], i: 0, next: time };
      if (pendingClear === null) text = "";
    }
    if (time < idle.next) return;
    if (idle.i < idle.phrase.length) {
      press(idle.phrase[idle.i], time);
      idle.i += 1;
      idle.next = time + IDLE_TYPE_S * (0.6 + Math.random() * 0.9);
    } else {
      press("Enter", time);
      idle = null;
      lastKeyAt = time - IDLE_AFTER_S + 2.5;
    }
  }

  function external(key, time) {
    idle = null;
    press(key, time);
  }

  const _world = new Vector3();
  const _target = new Vector3();
  const _parentQuat = new Quaternion();
  const _formQuat = new Quaternion();
  const _parentScale = new Vector3();

  const MAX_CELLS = Math.max(...GLYPH_KEYS.map((g) => glyphCells(g).length));
  let slots = null;

  function assignSlots(center, cell) {
    const cells = glyphCells(glyph).map(([cx, cy]) => ({ x: center.x + cx * cell, y: center.y + cy * cell }));
    const crew = units.slice(0, MAX_CELLS);
    const free = new Set(crew.keys());
    const next = new Array(crew.length).fill(null);
    cells.forEach((c) => {
      let best = -1;
      let bestD = Infinity;
      free.forEach((u) => {
        const prev = slots?.[u];
        const d = prev ? Math.hypot(prev.x - c.x, prev.y - c.y) : u;
        if (d < bestD) {
          bestD = d;
          best = u;
        }
      });
      free.delete(best);
      next[best] = { x: c.x, y: c.y, scale: 1 };
    });
    free.forEach((u) => {
      const prev = slots?.[u] ?? { x: center.x, y: center.y };
      next[u] = { x: prev.x, y: prev.y, scale: 0.001 };
    });
    slots = next;
  }

  function glyphTargets(time, center, cell) {
    if (!slots || time - glyphAt > GLYPH_HOLD_S) {
      if (slots) {
        const options = GLYPH_KEYS.filter((g) => g !== glyph);
        glyph = options[Math.floor(Math.random() * options.length)];
      }
      glyphAt = time;
      dirty = true;
      assignSlots(center, cell);
    }
    return units.map((_, i) => slots[i] ?? null);
  }

  function placeUnits({ time, dt, form, center, cell, vw, vh }) {
    formT = Math.max(0, Math.min(1, formT + (form ? dt : -dt) * FORM_SPEED));
    if (formT <= 0) {
      units.forEach((unit) => {
        if (!unit.formPos) return;
        unit.node.position.copy(unit.restPos);
        unit.node.quaternion.copy(unit.restQuat);
        unit.node.scale.copy(unit.restScale);
        unit.formPos = null;
        setDim(unit, null);
      });
      slots = null;
      return false;
    }
    const targets = glyphTargets(time, center, cell);
    const follow = 1 - Math.exp(-dt * FORM_FOLLOW);
    units.forEach((unit, i) => {
      const parent = unit.node.parent;
      const k = smooth(Math.max(0, Math.min(1, (formT * (1 + FORM_STAGGER) - unit.stagger * FORM_STAGGER))));
      const t = targets[i];
      if (!t) {
        unit.node.position.copy(unit.restPos);
        unit.node.quaternion.copy(unit.restQuat);
        unit.node.scale.copy(unit.restScale);
        unit.formPos = null;
        setDim(unit, null);
        return;
      }
      _target.set(t.x - vw / 2, vh / 2 - t.y, FORM_DEPTH);
      parent.localToWorld(_world.copy(unit.restPos));
      if (!unit.formPos) unit.formPos = _world.clone();
      unit.formPos.lerp(_target, follow);
      _world.lerp(unit.formPos, k);
      unit.node.position.copy(parent.worldToLocal(_world));
      parent.getWorldQuaternion(_parentQuat);
      _formQuat.copy(_parentQuat).invert().multiply(FACE_CAMERA);
      unit.node.quaternion.copy(unit.restQuat).slerp(_formQuat, k);
      parent.getWorldScale(_parentScale);
      const worldKey = (cell * 0.82 / 2) * t.scale;
      const formScale = worldKey / (_parentScale.x * unit.restScale.x);
      unit.node.scale.copy(unit.restScale).multiplyScalar(1 + (formScale - 1) * k);
      setDim(unit, k > 0.5 ? "lit" : null);
    });
    return true;
  }

  function setDim(unit, role) {
    if (unit.dimmed === role) return;
    unit.dimmed = role;
    const material = role === "lit"
      ? materials.accentDim
      : (unit.accent ? materials.accent : materials.key);
    unit.node.traverse((child) => {
      if (child.isMesh) child.material = material;
    });
  }

  function update({ x, y, width, vw, vh, time, dt, form, center, cell }) {
    group.visible = ready;
    if (!ready) return;
    group.position.set(x - vw / 2, vh / 2 - (y + Math.sin(time * 0.9) * 5), 0);
    group.scale.setScalar(width / MODEL_WIDTH);
    group.rotation.set(0.72 + Math.sin(time * 0.5) * 0.03, -0.32 + Math.sin(time * 0.35) * 0.05, 0.04);
    group.updateMatrixWorld(true);
    if (formT <= 0 && !form) stepIdle(time);
    if (pendingClear !== null && time >= pendingClear) {
      text = "";
      pendingClear = null;
      dirty = true;
    }
    pressable.forEach((entry) => {
      entry.press = Math.max(0, entry.press - dt * PRESS_DECAY);
      entry.node.position.y = entry.restY - PRESS_DEPTH * smooth(entry.press);
    });
    placeUnits({ time, dt, form, center, cell, vw, vh });
    const cursorOn = Math.floor(time * 2) % 2 === 0;
    const flash = Math.max(0, 1 - (time - flashAt) / 0.4);
    if (dirty || cursorOn !== lastCursor || flash > 0) {
      drawScreen(ctx, form ? glyph : text, cursorOn, palette, flash);
      screenTexture.needsUpdate = true;
      dirty = false;
      lastCursor = cursorOn;
    }
  }

  function dispose() {
    Object.values(materials).forEach((m) => m.dispose());
    screenTexture.dispose();
    panel.material.dispose();
    panel.geometry.dispose();
    bezel.geometry.dispose();
    stand.geometry.dispose();
    group.traverse((obj) => {
      if (obj.isMesh && obj.geometry) obj.geometry.dispose();
    });
  }

  return { group, update, external, setColors: applyColors, dispose };
}
