import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  NormalBlending,
  OrthographicCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { rangeProgress } from "./journeyTimeline.js";

export const TRANSITION_SCREENS = 0.45;
export const sideOf = (index) => (index % 2 === 0 ? 1 : -1);

const ROLE_OPACITY = { board: 0.5, accent: 0.95, hot: 1, soft: 0.45 };
const FRUSTUM_HALF_HEIGHT = 6.4;
const SCENE_SHIFT = 0.3;
const CAMERA_TARGET = new Vector3(0, 1.5, 0);
const PARTICLES = 500;

const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (min, max) => min + Math.random() * (max - min);

function ringPositions(radius, y = 0, segments = 48) {
  const out = [];
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    out.push(Math.cos(a0) * radius, y, Math.sin(a0) * radius, Math.cos(a1) * radius, y, Math.sin(a1) * radius);
  }
  return out;
}

function randomDirection(scale) {
  const v = new Vector3(rand(-1, 1), rand(-0.2, 1), rand(-1, 1));
  return v.normalize().multiplyScalar(scale);
}

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export function createJourneyHologram(canvas, timeline) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  const scene3d = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, -200, 200);
  camera.position.set(20, 20, 20).add(CAMERA_TARGET);
  camera.lookAt(CAMERA_TARGET);

  const world = new Group();
  scene3d.add(world);

  const colors = { board: new Color(), accent: new Color(), hot: new Color(), soft: new Color() };
  const materials = [];
  const pieces = new Map();
  const scenes = [];
  const tags = [];
  const disposables = [];
  const lastIndex = timeline.ranges.length - 1;
  const transitionLen = TRANSITION_SCREENS / timeline.total;
  let currentScene = null;
  let building = null;
  let halfWidth = FRUSTUM_HALF_HEIGHT;
  let width = 1;
  let height = 1;

  function track(item) {
    disposables.push(item);
    return item;
  }

  function lineMaterial(role, linewidth) {
    const mat = track(new LineMaterial({ color: 0xffffff, linewidth, transparent: true, depthWrite: false }));
    materials.push({ mat, role, piece: building });
    return mat;
  }

  function pointsMaterial(role, size) {
    const mat = track(new PointsMaterial({ size, sizeAttenuation: false, transparent: true, depthWrite: false }));
    materials.push({ mat, role, piece: building });
    return mat;
  }

  function segments(positions, { role = "accent", width: lw = 1.4 } = {}) {
    const lineGeometry = track(new LineSegmentsGeometry());
    lineGeometry.setPositions(positions);
    return new LineSegments2(lineGeometry, lineMaterial(role, lw));
  }

  function edges(geometry, { role = "accent", width: lw = 1.4, threshold = 20 } = {}) {
    const lineGeometry = track(new LineSegmentsGeometry().fromEdgesGeometry(new EdgesGeometry(geometry, threshold)));
    geometry.dispose();
    return new LineSegments2(lineGeometry, lineMaterial(role, lw));
  }

  function dots(positions, { role = "hot", size = 3.2 } = {}) {
    const geometry = track(new BufferGeometry());
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
    const node = new Points(geometry, pointsMaterial(role, size));
    node.frustumCulled = false;
    return node;
  }

  function box(w, h, d, y, options) {
    const node = edges(new BoxGeometry(w, h, d), options);
    node.position.y = y;
    return node;
  }

  function tower(w, h, d, { role = "accent", gap = 0.14 } = {}) {
    const group = new Group();
    group.add(box(w, h, d, h / 2, { role, width: 1.5 }));
    const stripes = [];
    for (let y = gap; y < h - 0.02; y += gap) {
      stripes.push(w / 2, y, -d / 2, w / 2, y, d / 2, -w / 2, y, d / 2, w / 2, y, d / 2);
    }
    group.add(segments(stripes, { role, width: 0.8 }));
    return group;
  }

  function geodesic(radius, { detail = 1, role = "hot", dotSize = 3 } = {}) {
    const group = new Group();
    const geometry = new IcosahedronGeometry(radius, detail);
    const pos = geometry.attributes.position;
    const seen = new Set();
    const vertices = [];
    for (let i = 0; i < pos.count; i++) {
      const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      vertices.push(pos.getX(i), pos.getY(i), pos.getZ(i));
    }
    group.add(edges(geometry, { role, width: 1.1, threshold: 1 }));
    group.add(dots(vertices, { role, size: dotSize }));
    return group;
  }

  function target(radius, { role = "hot", y = 0 } = {}) {
    const group = new Group();
    group.add(segments([...ringPositions(radius, y, 28), ...ringPositions(radius * 0.55, y, 20)], { role, width: 1.3 }));
    group.add(dots([0, y, 0], { role, size: 4 }));
    return group;
  }

  function orbit(radius, tiltX = 0.35, tiltZ = 0.2, role = "accent") {
    const holder = new Group();
    holder.rotation.set(tiltX, 0, tiltZ);
    holder.add(segments(ringPositions(radius, 0, 72), { role, width: 1.1 }));
    return holder;
  }

  function dropLine(x, y0, y1, z, role = "soft") {
    const out = [];
    for (let y = y0; y > y1; y -= 0.24) out.push(x, y, z, x, Math.max(y1, y - 0.12), z);
    return segments(out, { role, width: 1 });
  }

  function arc(a, b, lift, role = "soft") {
    const out = [];
    const steps = 24;
    const point = (t) => new Vector3().lerpVectors(a, b, t).setY(lerp(a.y, b.y, t) + Math.sin(Math.PI * t) * lift);
    for (let i = 0; i < steps; i += 2) {
      const p0 = point(i / steps);
      const p1 = point((i + 1) / steps);
      out.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
    }
    return { line: segments(out, { role, width: 1 }), point };
  }

  function boardBase(size) {
    const group = new Group();
    const half = size / 2;
    group.add(box(size, 0.4, size, -0.2, { role: "board", width: 1.2 }));
    group.add(box(size + 0.5, 0.16, size + 0.5, -0.5, { role: "board", width: 1 }));
    const grid = [];
    for (let i = 0; i <= size; i++) {
      const v = -half + i;
      grid.push(v, 0.01, -half, v, 0.01, half, -half, 0.01, v, half, 0.01, v);
    }
    group.add(segments(grid, { role: "board", width: 0.9 }));
    const ticks = [];
    for (let i = 0; i <= size * 2; i++) {
      const z = -half + i * 0.5;
      const len = i % 2 === 0 ? 0.4 : 0.2;
      ticks.push(half + 0.25, -0.2, z, half + 0.25 - len, -0.2, z);
    }
    group.add(segments(ticks, { role: "board", width: 1 }));
    return group;
  }

  function ringPad(radii, tickRadius) {
    const group = new Group();
    radii.forEach((r, i) => group.add(segments(ringPositions(r, 0.02, 96), { role: i === 0 ? "accent" : "board", width: i === 0 ? 1.4 : 1 })));
    const ticks = [];
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const len = i % 8 === 0 ? 0.35 : 0.16;
      ticks.push(Math.cos(a) * tickRadius, 0.02, Math.sin(a) * tickRadius, Math.cos(a) * (tickRadius + len), 0.02, Math.sin(a) * (tickRadius + len));
    }
    group.add(segments(ticks, { role: "board", width: 1 }));
    group.add(segments(ringPositions(radii[0], -0.3, 96), { role: "board", width: 1 }));
    return group;
  }

  function defineScene(id, spot, build) {
    const index = timeline.ranges.findIndex((range) => range.id === id);
    const root = new Group();
    world.add(root);
    currentScene = { id, index, root, pieces: [], shards: [], spot: new Vector3(...spot), shatter: 0 };
    build();
    scenes[index] = currentScene;
    currentScene = null;
  }

  function piece(id, { beat = 0, grow = "rise", position = [0, 0, 0], anchor = [0, 1, 0], labels = [], build, update }) {
    const group = new Group();
    group.position.set(...position);
    const owner = currentScene;
    building = {
      id,
      group,
      windows: [[`${owner.id}:${beat}`]],
      grow,
      anchor: new Vector3(...anchor),
      update,
      inVis: 0,
      vis: 0,
      parts: {},
      scene: owner,
    };
    build(group, building.parts);
    for (const child of [...group.children]) {
      const shard = new Group();
      group.remove(child);
      shard.add(child);
      group.add(shard);
      owner.shards.push({ node: shard, dir: randomDirection(rand(2.5, 6.5)), spin: new Vector3(rand(-3, 3), rand(-3, 3), rand(-3, 3)) });
    }
    labels.forEach(([text, at]) => tags.push({ text, at: typeof at === "function" ? at : new Vector3(...at), piece: building }));
    owner.root.add(group);
    owner.pieces.push(building);
    pieces.set(id, building);
    building = null;
  }

  function beatLocal(p, ref) {
    const beat = timeline.at(ref);
    return rangeProgress(p, beat.start, beat.end);
  }

  let satellitesForTags = [];
  let endingSatellites = [];
  const _sat = new Vector3();
  const _end = new Vector3();
  const _zero = new Vector3();

  const me = { id: "me", group: new Group(), anchor: new Vector3(0, 1.4, 0), vis: 0, parts: {} };
  building = me;
  me.parts.body = new Group();
  me.parts.body.add(box(1.0, 1.0, 1.0, 0, { role: "hot", width: 1.6 }));
  me.parts.body.add(dots([-0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5], { role: "hot", size: 4 }));
  me.parts.core = geodesic(0.3, { detail: 0, role: "accent", dotSize: 2.5 });
  me.group.add(me.parts.body, me.parts.core, target(0.95, { role: "accent", y: 0.02 }));
  building = null;
  world.add(me.group);
  pieces.set("me", me);

  defineScene("prologue", [-1.6, 0, 1.6], () => {
    piece("prologueBase", { grow: "fade", build: (g) => g.add(ringPad([3.7, 2.7, 1.3], 3.75)) });
    piece("firstPage", {
      beat: 1,
      grow: "scale",
      position: [1.2, 0, -1.1],
      anchor: [0, 2.85, 0],
      build(group, parts) {
        parts.cube = box(0.7, 0.7, 0.7, 2.3, { role: "hot", width: 1.6 });
        group.add(parts.cube, dropLine(0, 1.9, 0.05, 0), target(0.55, { role: "accent", y: 0.03 }));
      },
      update(self, { time }) {
        self.parts.cube.rotation.y = time * 0.6;
      },
    });
    piece("books", {
      beat: 2,
      grow: "scale",
      position: [1.2, 2.3, -1.1],
      anchor: [1.5, 0.5, 0.6],
      labels: [["DOCS", [-1.3, 0.75, 0.9]], ["COURSES", [1.4, 0.2, -0.9]]],
      build(group, parts) {
        parts.orbit = orbit(1.55, 0.45, 0.25);
        parts.satellites = Array.from({ length: 3 }, () => {
          const sat = box(0.24, 0.24, 0.24, 0, { role: "hot", width: 1.2 });
          parts.orbit.add(sat);
          return sat;
        });
        group.add(parts.orbit);
      },
      update(self, { time }) {
        self.parts.satellites.forEach((sat, i) => {
          const a = time * 0.7 + (i / 3) * Math.PI * 2;
          sat.position.set(Math.cos(a) * 1.55, 0, Math.sin(a) * 1.55);
          sat.rotation.y = a;
        });
      },
    });
  });

  defineScene("neolen", [-2.3, 0, 2.1], () => {
    piece("neolenBase", { grow: "fade", build: (g) => g.add(boardBase(8)) });
    piece("phone", {
      position: [1.0, 0, -1.2],
      anchor: [0, 3.05, 0],
      build(group) {
        group.add(tower(0.95, 2.6, 0.5, { role: "accent" }));
        group.add(target(0.42, { role: "hot", y: 2.62 }));
      },
    });
    piece("atom", {
      beat: 1,
      grow: "scale",
      position: [1.0, 4.4, -1.2],
      anchor: [0.9, 0.8, 0.3],
      build(group, parts) {
        parts.spin = new Group();
        [0, Math.PI / 3, (2 * Math.PI) / 3].forEach((angle) => {
          const holder = new Group();
          holder.rotation.set(Math.PI / 2, angle, 0);
          const ring = segments(ringPositions(0.95, 0, 56), { role: "accent", width: 1.2 });
          ring.scale.set(1, 1, 0.36);
          holder.add(ring);
          parts.spin.add(holder);
        });
        parts.spin.add(geodesic(0.26, { detail: 0, role: "hot", dotSize: 3 }));
        group.add(parts.spin, dropLine(0, -0.5, -1.7, 0));
      },
      update(self, { time }) {
        self.parts.spin.rotation.set(time * 0.3, time * 0.5, 0);
      },
    });
    piece("lineup", {
      beat: 2,
      grow: "scale",
      position: [-0.4, 0, 1.4],
      labels: [["XI", [0, 0.5, -1.5]]],
      build(group) {
        const formation = [[0, -1.5], [-1.2, -0.7], [-0.4, -0.7], [0.4, -0.7], [1.2, -0.7], [-1.2, 0.1], [-0.4, 0.1], [0.4, 0.1], [1.2, 0.1], [-0.4, 0.9], [0.4, 0.9]];
        formation.forEach(([x, z]) => {
          const node = target(0.22, { role: "hot", y: 0.03 });
          node.position.set(x, 0, z);
          group.add(node);
        });
      },
    });
    piece("downloads", {
      beat: 2,
      grow: "fade",
      position: [1.0, 0, -1.2],
      anchor: [0, 3.9, 0],
      build(group, parts) {
        parts.cubes = Array.from({ length: 7 }, () => {
          const cube = box(0.16, 0.16, 0.16, 0, { role: "hot", width: 1.2 });
          group.add(cube);
          return cube;
        });
      },
      update(self, { time }) {
        self.parts.cubes.forEach((cube, i) => {
          const t = (time * 0.4 + i / 7) % 1;
          const a = i * 2.4;
          cube.position.set(Math.cos(a) * 0.35, 2.8 + t * 1.6, Math.sin(a) * 0.35);
          cube.scale.setScalar(Math.max(0.001, 1 - t));
        });
      },
    });
  });

  defineScene("interlude", [0, 0, 0], () => {
    piece("interludeBase", { grow: "fade", build: (g) => g.add(ringPad([2.8, 1.9, 0.9], 2.85)) });
    piece("books2", {
      grow: "scale",
      position: [0, 3.4, 0],
      anchor: [1.0, 0.6, 0.4],
      build(group, parts) {
        parts.sphere = geodesic(1.0, { detail: 1, role: "hot" });
        parts.orbit = orbit(1.7, 0.5, -0.2);
        parts.satellites = Array.from({ length: 4 }, () => {
          const sat = box(0.22, 0.22, 0.22, 0, { role: "hot", width: 1.2 });
          parts.orbit.add(sat);
          return sat;
        });
        group.add(parts.sphere, parts.orbit, dropLine(0, -1.1, -2.6, 0));
      },
      update(self, { time }) {
        self.parts.sphere.rotation.y = time * 0.25;
        self.parts.satellites.forEach((sat, i) => {
          const a = -time * 0.6 + (i / 4) * Math.PI * 2;
          sat.position.set(Math.cos(a) * 1.7, 0, Math.sin(a) * 1.7);
        });
      },
    });
  });

  const front = new Vector3(-1.6, 2.1, -1.6);
  const back = new Vector3(1.9, 1.5, -1.3);
  defineScene("caprimul", [-2.6, 0, 2.4], () => {
    piece("caprimulBase", { grow: "fade", build: (g) => g.add(boardBase(9)) });
    piece("frontendTower", {
      position: [-1.6, 0, -1.6],
      labels: [["NUXT", [0, 2.5, 0]]],
      build(group) {
        group.add(tower(1.0, 2.0, 1.0));
        const side = tower(0.7, 1.2, 0.7);
        side.position.set(0.95, 0, 0.3);
        group.add(side);
      },
    });
    piece("backendTower", {
      position: [1.9, 0, -1.3],
      labels: [["NODE", [0, 1.9, 0]]],
      build(group) {
        [0, 0.48, 0.96].forEach((y) => {
          const slab = tower(1.4, 0.42, 1.4, { gap: 0.1 });
          slab.position.y = y;
          group.add(slab);
        });
      },
    });
    piece("packets", {
      grow: "fade",
      anchor: [0.15, 3.3, -1.45],
      build(group, parts) {
        const link = arc(front, back, 1.3);
        parts.point = link.point;
        group.add(link.line);
        parts.cubes = Array.from({ length: 3 }, () => {
          const cube = box(0.15, 0.15, 0.15, 0, { role: "hot", width: 1.2 });
          group.add(cube);
          return cube;
        });
      },
      update(self, { time }) {
        self.parts.cubes.forEach((cube, i) => {
          const raw = (time * 0.35 + i / 3) % 1;
          cube.position.copy(self.parts.point(i === 1 ? 1 - raw : raw));
        });
      },
    });
    piece("app1", {
      beat: 1,
      position: [2.3, 0, 1.6],
      anchor: [0, 2.25, 0],
      build(group, parts) {
        group.add(tower(1.0, 1.3, 1.0, { role: "hot" }));
        parts.node = target(0.4, { role: "accent", y: 1.9 });
        group.add(parts.node, dropLine(0, 1.85, 1.35, 0));
      },
      update(self, { time }) {
        self.parts.node.rotation.y = time * 0.8;
      },
    });
    piece("app2", {
      beat: 2,
      position: [-0.4, 0, 2.5],
      anchor: [0, 2.25, 0],
      build(group, parts) {
        group.add(tower(1.0, 1.3, 1.0, { role: "hot" }));
        parts.node = target(0.4, { role: "accent", y: 1.9 });
        group.add(parts.node, dropLine(0, 1.85, 1.35, 0));
      },
      update(self, { time }) {
        self.parts.node.rotation.y = -time * 0.8;
      },
    });
  });

  defineScene("iocod", [-3.0, 0, 3.0], () => {
    piece("iocodBase", { grow: "fade", build: (g) => g.add(boardBase(10)) });
    piece("market", {
      position: [0.2, 0, 0],
      anchor: [0, 2.5, 0],
      build(group) {
        group.add(tower(1.2, 2.0, 1.2, { role: "hot" }));
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const stall = tower(0.6, 0.7 + (i % 3) * 0.25, 0.6);
          stall.position.set(Math.cos(a) * 1.9, 0, Math.sin(a) * 1.9);
          group.add(stall);
        }
        group.add(segments(ringPositions(1.9, 0.03, 64), { role: "soft", width: 1 }));
      },
    });
    piece("users", {
      beat: 1,
      grow: "fade",
      anchor: [3.0, 0.4, 2.6],
      build(group, parts) {
        const random = seeded(7);
        parts.nodes = [];
        for (let i = 0; i < 26; i++) {
          let x;
          let z;
          do {
            x = (random() - 0.5) * 9;
            z = (random() - 0.5) * 9;
          } while (Math.hypot(x - 0.2, z) < 2.6);
          const node = target(0.2, { role: "hot", y: 0.03 });
          node.position.set(x, 0, z);
          group.add(node);
          parts.nodes.push(node);
        }
      },
      update(self, { p }) {
        const local = beatLocal(p, "iocod:1");
        self.parts.nodes.forEach((node, i) => {
          node.scale.setScalar(Math.max(0.001, smooth(rangeProgress(local, i / 40, i / 40 + 0.25))));
        });
      },
    });
    piece("cloud", {
      beat: 2,
      grow: "scale",
      position: [0.2, 4.6, 0],
      anchor: [1.3, 0, 0],
      labels: [["CI/CD", [0, 1.35, 0]], ["AWS", [-1.4, 0.15, 0]]],
      build(group, parts) {
        const r = 1.3;
        const verts = [[r, 0, 0], [-r, 0, 0], [0, r, 0], [0, -r, 0], [0, 0, r], [0, 0, -r]];
        const links = [];
        verts.forEach((a, i) => verts.forEach((b, j) => {
          if (j <= i) return;
          if (Math.abs(a[0] + b[0]) + Math.abs(a[1] + b[1]) + Math.abs(a[2] + b[2]) < 0.01) return;
          links.push(...a, ...b);
        }));
        parts.spin = new Group();
        parts.spin.add(segments(links, { role: "accent", width: 1.2 }));
        verts.forEach((v) => {
          const node = target(0.22, { role: "hot" });
          node.position.set(...v);
          parts.spin.add(node);
        });
        group.add(parts.spin, dropLine(r * 0.7, -0.6, -4.6, r * 0.7), dropLine(-r * 0.7, -0.6, -4.6, -r * 0.7));
      },
      update(self, { time }) {
        self.parts.spin.rotation.y = time * 0.25;
      },
    });
  });

  defineScene("discern", [-2.4, 0, 2.4], () => {
    piece("discernBase", {
      grow: "fade",
      build(group) {
        group.add(box(7.6, 6.2, 7.6, 3.1, { role: "board", width: 1 }));
        group.add(ringPad([3.6, 2.5, 1.2], 3.65));
      },
    });
    piece("platform", {
      position: [0.4, 3.2, -0.4],
      anchor: [0, 1.5, 0],
      build(group, parts) {
        const spread = [[-2.0, 0.2, 0.8], [1.6, -0.4, -1.4], [0.9, 0.5, 1.9]];
        parts.small = spread.map(([x, y, z]) => {
          const sphere = geodesic(0.45, { detail: 1 });
          sphere.position.set(x, y, z);
          sphere.userData.start = new Vector3(x, y, z);
          group.add(sphere);
          return sphere;
        });
        parts.big = geodesic(1.3, { detail: 2, dotSize: 2.6 });
        group.add(parts.big, dropLine(0, -1.4, -3.2, 0));
      },
      update(self, { p, time }) {
        const local = beatLocal(p, "discern:0");
        const merge = smooth(rangeProgress(local, 0.15, 0.65));
        const settle = smooth(rangeProgress(local, 0.55, 0.95));
        self.parts.small.forEach((sphere) => {
          sphere.position.lerpVectors(sphere.userData.start, _zero, merge);
          sphere.scale.setScalar(Math.max(0.001, 1 - settle));
        });
        self.parts.big.scale.setScalar(Math.max(0.001, settle));
        self.parts.big.rotation.y = time * 0.2;
      },
    });
    piece("shield", {
      beat: 1,
      grow: "scale",
      position: [0.4, 3.2, -0.4],
      anchor: [1.5, 1.2, 0.6],
      build(group, parts) {
        group.add(edges(new IcosahedronGeometry(2.1, 1), { role: "soft", width: 0.9, threshold: 1 }));
        parts.scan = orbit(2.4, Math.PI / 2 - 0.25, 0, "accent");
        group.add(parts.scan);
      },
      update(self, { time }) {
        self.parts.scan.position.y = Math.sin(time * 0.9) * 1.6;
        self.parts.scan.scale.setScalar(Math.max(0.2, Math.cos(Math.asin(Math.sin(time * 0.9) * 0.66))));
      },
    });
    piece("aws", {
      beat: 2,
      grow: "scale",
      position: [0.4, 3.2, -0.4],
      anchor: [-2.7, 0.3, 0],
      labels: [
        ["ECS", (t) => satPoint(0, t)],
        ["GLUE", (t) => satPoint(1, t)],
        ["REDSHIFT", (t) => satPoint(2, t)],
        ["DYNAMODB", (t) => satPoint(3, t)],
      ],
      build(group, parts) {
        parts.orbit = orbit(2.8, 0.42, -0.28);
        parts.satellites = Array.from({ length: 4 }, () => {
          const sat = box(0.26, 0.26, 0.26, 0, { role: "hot", width: 1.3 });
          parts.orbit.add(sat);
          return sat;
        });
        group.add(parts.orbit);
        satellitesForTags = parts.satellites;
      },
      update(self, { time }) {
        self.parts.satellites.forEach((sat, i) => {
          const a = time * 0.35 + (i / 4) * Math.PI * 2;
          sat.position.set(Math.cos(a) * 2.8, 0, Math.sin(a) * 2.8);
          sat.rotation.y = a;
        });
      },
    });
  });

  function satPoint(i) {
    const sat = satellitesForTags[i];
    if (!sat) return null;
    _sat.set(0, 0.3, 0);
    return sat.localToWorld(_sat);
  }

  defineScene("ending", [0, 0, 0], () => {
    piece("endingBase", { grow: "fade", build: (g) => g.add(ringPad([3.4, 2.4, 1.2], 3.45)) });
    piece("orbit", {
      grow: "scale",
      position: [0, 1.6, 0],
      anchor: [0, 1.9, 0],
      labels: ["NEOLEN", "CAPRIMUL", "IOCOD", "DISCERN"].map((name, i) => [name, (t) => endingPoint(i, t)]),
      build(group, parts) {
        parts.orbit = orbit(2.6, 0.3, 0.12);
        parts.satellites = Array.from({ length: 4 }, (_, i) => {
          const sat = i % 2 === 0 ? box(0.3, 0.3, 0.3, 0, { role: "hot", width: 1.3 }) : geodesic(0.22, { detail: 0 });
          parts.orbit.add(sat);
          return sat;
        });
        group.add(parts.orbit);
        endingSatellites = parts.satellites;
      },
      update(self, { time }) {
        self.parts.satellites.forEach((sat, i) => {
          const a = time * 0.3 + (i / 4) * Math.PI * 2;
          sat.position.set(Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6);
        });
      },
    });
  });

  function endingPoint(i) {
    const sat = endingSatellites[i];
    if (!sat) return null;
    _end.set(0, 0.35, 0);
    return sat.localToWorld(_end);
  }

  const particleGeometry = track(new BufferGeometry());
  const particleSeeds = new Float32Array(PARTICLES * 3);
  const particleDirs = new Float32Array(PARTICLES * 3);
  const particlePositions = new Float32Array(PARTICLES * 3);
  for (let i = 0; i < PARTICLES; i++) {
    const r = Math.cbrt(Math.random()) * 3.5;
    const dir = randomDirection(1);
    particleSeeds.set([dir.x * r, Math.abs(dir.y) * r * 0.8 + 0.5, dir.z * r], i * 3);
    const out = randomDirection(rand(3, 7));
    particleDirs.set([out.x, out.y, out.z], i * 3);
  }
  particleGeometry.setAttribute("position", new BufferAttribute(particlePositions, 3));
  const particleMaterial = track(new PointsMaterial({ size: 2, sizeAttenuation: false, transparent: true, depthWrite: false }));
  const particles = new Points(particleGeometry, particleMaterial);
  particles.frustumCulled = false;
  world.add(particles);

  function sideAt(p) {
    const k = timeline.chapterIndexAt(p);
    if (k >= lastIndex) return sideOf(k);
    const range = timeline.ranges[k];
    const t = smooth(rangeProgress(p, range.end - transitionLen, range.end));
    return lerp(sideOf(k), sideOf(k + 1), t);
  }

  function textAlphaAt(p) {
    const k = timeline.chapterIndexAt(p);
    const range = timeline.ranges[k];
    const fadeOut = k < lastIndex ? 1 - smooth(rangeProgress(p, range.end - transitionLen, range.end - transitionLen * 0.4)) : 1;
    const fadeIn = k > 0 ? smooth(rangeProgress(p, range.start, range.start + transitionLen * 0.6)) : 1;
    return Math.min(fadeOut, fadeIn);
  }

  function applyPiece(self, p, time, shatter) {
    const inVis = timeline.visibility(p, self.windows);
    self.inVis = inVis;
    self.vis = inVis * (1 - smooth(shatter));
    self.group.visible = self.vis > 0.002;
    if (!self.group.visible) return;
    const eased = smooth(inVis);
    if (self.grow === "rise") self.group.scale.set(1, Math.max(0.001, eased), 1);
    else if (self.grow === "scale") self.group.scale.setScalar(Math.max(0.001, 0.35 + 0.65 * eased));
    self.update?.(self, { p, time });
  }

  function updateScenes(p, time) {
    let burst = null;
    for (const sc of scenes) {
      const range = timeline.ranges[sc.index];
      const isLast = sc.index === lastIndex;
      sc.shatter = isLast ? 0 : rangeProgress(p, range.end - transitionLen, range.end);
      sc.root.visible = p >= range.start - transitionLen && (isLast || p < range.end);
      if (!sc.root.visible) {
        sc.pieces.forEach((self) => { self.vis = 0; });
        continue;
      }
      const e = sc.shatter * sc.shatter;
      for (const shard of sc.shards) {
        shard.node.position.copy(shard.dir).multiplyScalar(e);
        shard.node.rotation.set(shard.spin.x * e, shard.spin.y * e, shard.spin.z * e);
      }
      sc.pieces.forEach((self) => applyPiece(self, p, time, sc.shatter));
      if (sc.shatter > 0 && sc.shatter < 1) burst = sc.shatter;
    }
    particles.visible = burst !== null;
    if (burst !== null) {
      const e = burst * (2 - burst);
      for (let i = 0; i < particlePositions.length; i++) particlePositions[i] = particleSeeds[i] + particleDirs[i] * e;
      particleGeometry.attributes.position.needsUpdate = true;
      particleMaterial.opacity = Math.sin(Math.PI * burst) * 0.75;
    }
  }

  const _spot = new Vector3();
  function updateMe(p, time) {
    const k = timeline.chapterIndexAt(p);
    const from = scenes[k].spot;
    let spot = from;
    if (k < lastIndex) {
      const range = timeline.ranges[k];
      const t = smooth(rangeProgress(p, range.end - transitionLen * 0.6, range.end + transitionLen * 0.2));
      spot = _spot.lerpVectors(from, scenes[k + 1].spot, t);
    }
    me.group.position.copy(spot);
    me.vis = timeline.visibility(p, [["prologue:0"]]);
    me.group.visible = me.vis > 0.002;
    me.group.scale.setScalar(Math.max(0.001, 0.35 + 0.65 * smooth(me.vis)));
    const bob = Math.sin(time * 1.6) * 0.07;
    me.parts.body.position.y = 0.75 + bob;
    me.parts.core.position.y = 0.75 + bob;
    me.parts.body.rotation.y = Math.sin(time * 0.4) * 0.15;
    me.parts.core.rotation.set(time * 0.5, time * 0.8, 0);
  }

  function applyCamera(p) {
    const shift = sideAt(p) * halfWidth * SCENE_SHIFT;
    camera.left = -halfWidth - shift;
    camera.right = halfWidth - shift;
    camera.updateProjectionMatrix();
  }

  function update(p, time) {
    world.rotation.y = Math.sin(time * 0.15) * 0.05;
    updateScenes(p, time);
    updateMe(p, time);
    for (const entry of materials) {
      const pieceVis = entry.piece ? entry.piece.vis : 1;
      entry.mat.opacity = ROLE_OPACITY[entry.role] * pieceVis;
    }
    applyCamera(p);
    world.updateMatrixWorld(true);
  }

  function resize(w, h) {
    width = Math.max(1, w);
    height = Math.max(1, h);
    renderer.setSize(width, height, false);
    halfWidth = FRUSTUM_HALF_HEIGHT * (width / height);
    camera.top = FRUSTUM_HALF_HEIGHT;
    camera.bottom = -FRUSTUM_HALF_HEIGHT;
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.updateProjectionMatrix();
    for (const entry of materials) {
      if (entry.mat.isLineMaterial) entry.mat.resolution.set(width, height);
    }
  }

  function setTheme({ board, accent, hot, soft, additive }) {
    colors.board.set(board);
    colors.accent.set(accent);
    colors.hot.set(hot);
    colors.soft.set(soft);
    const blending = additive ? AdditiveBlending : NormalBlending;
    for (const entry of materials) {
      entry.mat.color.copy(colors[entry.role]);
      entry.mat.blending = blending;
      entry.mat.needsUpdate = true;
    }
    particleMaterial.color.copy(colors.accent);
    particleMaterial.blending = blending;
    particleMaterial.needsUpdate = true;
  }

  const _anchor = new Vector3();
  function toScreen(vec) {
    vec.project(camera);
    return { x: (vec.x * 0.5 + 0.5) * width, y: (-vec.y * 0.5 + 0.5) * height };
  }

  function anchor(id) {
    const self = pieces.get(id);
    if (!self || !self.group.visible) return null;
    _anchor.copy(self.anchor);
    self.group.localToWorld(_anchor);
    return { ...toScreen(_anchor), vis: self.vis };
  }

  function tagPosition(i, time) {
    const tag = tags[i];
    if (!tag.piece.group.visible || tag.piece.vis < 0.05) return null;
    let point;
    if (typeof tag.at === "function") {
      const world = tag.at(time);
      if (!world) return null;
      point = _anchor.copy(world);
    } else {
      point = tag.piece.group.localToWorld(_anchor.copy(tag.at));
    }
    return { ...toScreen(point), vis: tag.piece.vis };
  }

  function render() {
    renderer.render(scene3d, camera);
  }

  function dispose() {
    disposables.forEach((item) => item.dispose?.());
    renderer.dispose();
  }

  return {
    update,
    resize,
    setTheme,
    anchor,
    tagPosition,
    tagTexts: tags.map((tag) => tag.text),
    render,
    dispose,
    sideAt,
    textAlphaAt,
  };
}
