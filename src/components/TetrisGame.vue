<template>
  <div ref="outerRef" class="w-full">
    <div class="mx-auto overflow-visible" :style="{ width: scaledWidth + 'px', height: scaledHeight + 'px' }">
      <div :style="{
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: '500px',
        height: '510px',
      }">
        <div id="tetris-game" class="relative p-3">
          <div class="top-left-fill -z-10"></div>
          <div class="bottom-left-fill -z-10"></div>

          <img :src="Green" alt="" class="absolute left-7 -top-9 -z-10" />
          <img :src="Blue" alt="" class="absolute -right-13 -bottom-11 -z-10" />
          <img :src="BoltTopLeft" alt="" class="absolute top-0 left-0 ml-3 mt-3" />
          <img :src="BoltTopRight" alt="" class="absolute top-0 right-0 mr-3 mt-3" />
          <img :src="BoltDownLeft" alt="" class="absolute bottom-0 left-0 ml-3 mb-3" />
          <img :src="BoltDownRight" alt="" class="absolute bottom-0 right-0 mr-3 mb-3" />

          <div class="m-6">
            <p class="text-[10px] text-white/40 mb-2">// tetris</p>

            <div class="relative" style="width: 200px;">
              <canvas ref="gameBoard" width="200" height="400" class="rounded-lg bg-[#010C15]"></canvas>

              <div v-if="!gameRunning" class="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
                style="background: rgba(1, 22, 39, 0.88);">
                <p v-if="gameOver" class="text-xs mb-3 text-[#E99287]">// game over</p>
                <button @click="startGame" class="rounded-md px-3 py-1.5 bg-[#FEA55F] text-black text-xs">
                  {{ buttonText }}
                </button>
              </div>
            </div>
          </div>

          <div class="absolute right-0 top-0 m-9 w-44 text-white">
            <div class="bg-[#01142330] p-3 rounded-lg">
              <p class="text-xs">// next</p>
              <div class="next-grid mt-2">
                <div v-for="(cell, idx) in nextGridFlat" :key="idx" class="next-cell"
                  :style="{ backgroundColor: cell || 'rgba(255,255,255,0.05)' }"></div>
              </div>
            </div>

            <div class="mt-3 bg-[#01142330] p-3 rounded-lg text-xs space-y-1">
              <p class="flex justify-between"><span>score</span><span class="text-accent-variable">{{ score }}</span></p>
              <p class="flex justify-between"><span>lines</span><span class="text-accent-variable">{{ lines }}</span></p>
              <p class="flex justify-between"><span>level</span><span class="text-accent-variable">{{ level }}</span></p>
            </div>

            <div class="mt-3 bg-[#01142330] p-3 rounded-lg">
              <p class="text-xs">// arrows to move</p>
              <p class="text-xs">// up to rotate</p>

              <div class="grid grid-cols-3 gap-1 mt-3">
                <div></div>
                <button @pointerdown.prevent="handleControlClick('ROTATE')" :class="btnClass('ROTATE')"
                  class="rounded-lg min-h-7 flex items-center justify-center">
                  <img :src="Up" alt="Rotate" />
                </button>
                <div></div>
                <button @pointerdown.prevent="handleControlClick('LEFT')" :class="btnClass('LEFT')"
                  class="rounded-lg min-h-7 flex items-center justify-center">
                  <img :src="Left" alt="Left" />
                </button>
                <button @pointerdown.prevent="handleControlClick('DOWN')" :class="btnClass('DOWN')"
                  class="rounded-lg min-h-7 flex items-center justify-center">
                  <img :src="Down" alt="Down" />
                </button>
                <button @pointerdown.prevent="handleControlClick('RIGHT')" :class="btnClass('RIGHT')"
                  class="rounded-lg min-h-7 flex items-center justify-center">
                  <img :src="Right" alt="Right" />
                </button>
              </div>
            </div>

            <button class="absolute -bottom-16 right-0 rounded-md p-2 border border-white text-white"
              @click="$emit('skip')">
              back
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import Green from "@/assets/vectors/Green.svg";
import Blue from "@/assets/vectors/Blue.svg";
import BoltDownLeft from "@/assets/icons/bolt-down-left.svg";
import BoltDownRight from "@/assets/icons/bolt-down-right.svg";
import BoltTopLeft from "@/assets/icons/bolt-up-left.svg";
import BoltTopRight from "@/assets/icons/bolt-up-right.svg";
import Up from "@/assets/icons/up.svg";
import Down from "@/assets/icons/down.svg";
import Left from "@/assets/icons/left.svg";
import Right from "@/assets/icons/right.svg";

defineEmits(["skip"]);

// ─── scaling ─────────────────────────────────────────────────────────────────
const GAME_W = 500;
const GAME_H = 510;
const outerRef = ref(null);
const scale = ref(1);
const scaledWidth = computed(() => GAME_W * scale.value);
const scaledHeight = computed(() => GAME_H * scale.value);

function computeScale() {
  if (!outerRef.value) return;
  scale.value = Math.min(1, outerRef.value.offsetWidth / GAME_W);
}

let ro;

// ─── board config ────────────────────────────────────────────────────────────
const COLS = 10;
const ROWS = 20;
const BLOCK = 20;
const BOARD_W = COLS * BLOCK;
const BOARD_H = ROWS * BLOCK;

// Every piece is defined on a uniform 4x4 grid so rotation is a single
// generic matrix transform — no per-piece wall-kick tables needed.
const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  T: [
    [0, 0, 0, 0],
    [0, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  S: [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0],
  ],
  Z: [
    [0, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [0, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  L: [
    [0, 0, 0, 0],
    [0, 0, 1, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
  ],
};

const COLORS = {
  I: "#43D9AD",
  O: "#FEA55F",
  T: "#B39DDB",
  S: "#7EE787",
  Z: "#E99287",
  J: "#59A8FF",
  L: "#FFD580",
};

const PIECE_TYPES = Object.keys(SHAPES);

// ─── reactive state ──────────────────────────────────────────────────────────
const gameBoard = ref(null);
const gameRunning = ref(false);
const gameOver = ref(false);
const buttonText = ref("start-game");
const score = ref(0);
const lines = ref(0);
const level = ref(1);
const nextType = ref(PIECE_TYPES[0]);
const highlightedKey = ref("");

const nextGridFlat = computed(() => {
  const matrix = SHAPES[nextType.value];
  const color = COLORS[nextType.value];
  const flat = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      flat.push(matrix[i][j] ? color : null);
    }
  }
  return flat;
});

function btnClass(dir) {
  return {
    "bg-[#FEA55F]": highlightedKey.value === dir,
    "bg-[#010C15]": highlightedKey.value !== dir,
  };
}

// ─── non-reactive game state ─────────────────────────────────────────────────
let board = [];
let piece = null;
let running = false;
let rafId = null;
let frameCounter = 0;
let bag = [];
let heldDirection = null;
let heldFrames = 0;
const DAS = 10; // frames before auto-repeat kicks in
const ARR = 3; // frames between repeats

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function nextFromBag() {
  if (!bag.length) bag = shuffle([...PIECE_TYPES]);
  return bag.pop();
}

function spawnPiece() {
  const type = nextType.value;
  nextType.value = nextFromBag();
  const matrix = SHAPES[type].map((row) => [...row]);
  piece = { type, matrix, color: COLORS[type], row: 0, col: 3 };
}

function collides(matrix, row, col) {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (!matrix[i][j]) continue;
      const r = row + i;
      const c = col + j;
      if (c < 0 || c >= COLS || r >= ROWS) return true;
      if (r >= 0 && board[r][c]) return true;
    }
  }
  return false;
}

function tryMove(dr, dc) {
  const newRow = piece.row + dr;
  const newCol = piece.col + dc;
  if (collides(piece.matrix, newRow, newCol)) return false;
  piece.row = newRow;
  piece.col = newCol;
  return true;
}

function rotateMatrix(matrix) {
  const n = matrix.length;
  const result = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[i][j] = matrix[n - 1 - j][i];
    }
  }
  return result;
}

function tryRotate() {
  const rotated = rotateMatrix(piece.matrix);
  for (const kick of [0, -1, 1, -2, 2]) {
    if (!collides(rotated, piece.row, piece.col + kick)) {
      piece.matrix = rotated;
      piece.col += kick;
      return true;
    }
  }
  return false;
}

function getGhostRow() {
  let r = piece.row;
  while (!collides(piece.matrix, r + 1, piece.col)) r++;
  return r;
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every((cell) => cell)) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (cleared > 0) {
    lines.value += cleared;
    const points = [0, 100, 300, 500, 800][cleared] * level.value;
    score.value += points;
    level.value = Math.floor(lines.value / 10) + 1;
  }
}

function lockPiece() {
  piece.matrix.forEach((row, i) => {
    row.forEach((val, j) => {
      if (!val) return;
      const r = piece.row + i;
      const c = piece.col + j;
      if (r >= 0) board[r][c] = piece.color;
    });
  });
  clearLines();
  spawnPiece();
  if (collides(piece.matrix, piece.row, piece.col)) {
    endGame();
  }
}

function handleHeldMovement() {
  if (!heldDirection) return;
  heldFrames++;
  if (heldFrames === DAS || (heldFrames > DAS && (heldFrames - DAS) % ARR === 0)) {
    if (heldDirection === "LEFT") tryMove(0, -1);
    else if (heldDirection === "RIGHT") tryMove(0, 1);
    else if (heldDirection === "DOWN") {
      if (tryMove(1, 0)) score.value += 1;
      else lockPiece();
    }
  }
}

function drawCell(ctx, r, c, color, ghost = false) {
  const x = c * BLOCK;
  const y = r * BLOCK;
  if (ghost) {
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.4;
    ctx.strokeRect(x + 1, y + 1, BLOCK - 2, BLOCK - 2);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, BLOCK - 2, BLOCK - 2);
  }
}

function draw() {
  const ctx = gameBoard.value.getContext("2d");
  ctx.fillStyle = "#010C15";
  ctx.fillRect(0, 0, BOARD_W, BOARD_H);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) drawCell(ctx, r, c, board[r][c]);
    }
  }

  const ghostRow = getGhostRow();
  piece.matrix.forEach((row, i) => {
    row.forEach((val, j) => {
      if (!val) return;
      const r = ghostRow + i;
      const c = piece.col + j;
      if (r >= 0) drawCell(ctx, r, c, piece.color, true);
    });
  });

  piece.matrix.forEach((row, i) => {
    row.forEach((val, j) => {
      if (!val) return;
      const r = piece.row + i;
      const c = piece.col + j;
      if (r >= 0) drawCell(ctx, r, c, piece.color);
    });
  });
}

function resetGame() {
  board = createEmptyBoard();
  score.value = 0;
  lines.value = 0;
  level.value = 1;
  bag = [];
  nextType.value = nextFromBag();
  spawnPiece();
  gameOver.value = false;
}

function loop() {
  if (!running) return;
  rafId = requestAnimationFrame(loop);
  frameCounter++;
  handleHeldMovement();
  const dropInterval = Math.max(6, 36 - (level.value - 1) * 3);
  if (frameCounter >= dropInterval) {
    frameCounter = 0;
    if (!tryMove(1, 0)) lockPiece();
  }
  draw();
}

function startGame() {
  resetGame();
  gameRunning.value = true;
  buttonText.value = "retry";
  running = true;
  frameCounter = 0;
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("keyup", handleKeyup);
  loop();
}

function endGame() {
  running = false;
  gameRunning.value = false;
  gameOver.value = true;
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("keyup", handleKeyup);
}

function flashKey(dir) {
  highlightedKey.value = dir;
  setTimeout(() => {
    if (highlightedKey.value === dir) highlightedKey.value = "";
  }, 200);
}

function handleControlClick(direction) {
  if (!gameRunning.value) return;
  flashKey(direction);
  if (direction === "LEFT") tryMove(0, -1);
  else if (direction === "RIGHT") tryMove(0, 1);
  else if (direction === "DOWN") {
    if (tryMove(1, 0)) score.value += 1;
    else lockPiece();
  } else if (direction === "ROTATE") tryRotate();
}

function handleKeydown(e) {
  if (!running) return;
  switch (e.key) {
    case "ArrowLeft":
      e.preventDefault();
      if (heldDirection !== "LEFT") {
        heldDirection = "LEFT";
        heldFrames = 0;
        tryMove(0, -1);
        flashKey("LEFT");
      }
      break;
    case "ArrowRight":
      e.preventDefault();
      if (heldDirection !== "RIGHT") {
        heldDirection = "RIGHT";
        heldFrames = 0;
        tryMove(0, 1);
        flashKey("RIGHT");
      }
      break;
    case "ArrowDown":
      e.preventDefault();
      if (heldDirection !== "DOWN") {
        heldDirection = "DOWN";
        heldFrames = 0;
        if (tryMove(1, 0)) score.value += 1;
        else lockPiece();
        flashKey("DOWN");
      }
      break;
    case "ArrowUp":
      e.preventDefault();
      tryRotate();
      flashKey("ROTATE");
      break;
    case " ":
      e.preventDefault();
      while (tryMove(1, 0)) score.value += 2;
      lockPiece();
      break;
  }
}

function handleKeyup(e) {
  if (
    (e.key === "ArrowLeft" && heldDirection === "LEFT") ||
    (e.key === "ArrowRight" && heldDirection === "RIGHT") ||
    (e.key === "ArrowDown" && heldDirection === "DOWN")
  ) {
    heldDirection = null;
    heldFrames = 0;
  }
}

onMounted(() => {
  resetGame();
  draw();
  computeScale();
  ro = new ResizeObserver(computeScale);
  ro.observe(outerRef.value);
});

onUnmounted(() => {
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  ro?.disconnect();
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("keyup", handleKeyup);
});
</script>

<style scoped>
#tetris-game {
  width: 500px;
  height: 510px;
  border-radius: 8px;
  border: 1px solid #0c1616;
  background: linear-gradient(150deg,
      rgba(23, 85, 83, 0.7) 1.7%,
      rgba(67, 217, 173, 0.09) 81.82%);
  box-shadow: 0px 2px 0px 0px rgba(255, 255, 255, 0.3) inset;
  backdrop-filter: blur(32px);
}

.next-grid {
  display: grid;
  grid-template-columns: repeat(4, 14px);
  grid-template-rows: repeat(4, 14px);
  gap: 2px;
}

.next-cell {
  width: 14px;
  height: 14px;
  border-radius: 2px;
}

.top-left-fill,
.bottom-left-fill,
.bottom-right-fill {
  position: absolute;
  width: 100px;
  height: 100px;
  filter: blur(70px);
}

.top-left-fill {
  top: 27px;
  left: 0;
  background: #43d9ad;
}

.bottom-left-fill {
  bottom: 9px;
  left: 23px;
  background: #43d9ad;
}

.bottom-right-fill {
  bottom: 0;
  right: 0;
  background: #4d5bce;
}
</style>
