<template>
  <div ref="outerRef" class="w-full">
    <div class="mx-auto overflow-visible" :style="{ width: scaledWidth + 'px', height: scaledHeight + 'px' }">
      <div :style="{
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: '580px',
        height: '480px',
      }">
        <div id="sudoku-game" class="relative p-3">
          <div class="top-left-fill -z-10"></div>
          <div class="bottom-left-fill -z-10"></div>

          <img :src="Green" alt="" class="absolute left-7 -top-9 -z-10" />
          <img :src="Blue" alt="" class="absolute -right-13 -bottom-11 -z-10" />
          <img :src="BoltTopLeft" alt="" class="absolute top-0 left-0 ml-3 mt-3" />
          <img :src="BoltTopRight" alt="" class="absolute top-0 right-0 mr-3 mt-3" />
          <img :src="BoltDownLeft" alt="" class="absolute bottom-0 left-0 ml-3 mb-3" />
          <img :src="BoltDownRight" alt="" class="absolute bottom-0 right-0 mr-3 mb-3" />

          <div class="m-9 pt-3">
            <p class="text-[10px] text-white/40 mb-2">// sudoku</p>

            <div class="relative" style="width: 306px;">
              <div class="sudoku-grid">
                <div v-for="(val, idx) in flatBoard" :key="idx" :class="cellClass(Math.floor(idx / 9), idx % 9)"
                  @click="selectCell(Math.floor(idx / 9), idx % 9)">
                  {{ val || "" }}
                </div>
              </div>

              <div v-if="completed || gameOver"
                class="absolute inset-0 flex flex-col items-center justify-center rounded-sm"
                style="background: rgba(1, 22, 39, 0.88);">
                <p class="text-xs mb-3" :class="completed ? 'text-[#43D9AD]' : 'text-[#E99287]'">
                  {{ completed ? "// puzzle solved!" : "// too many mistakes" }}
                </p>
                <button @click="newGame" class="rounded-md px-3 py-1.5 bg-[#FEA55F] text-black text-xs">
                  {{ completed ? "new-game" : "retry" }}
                </button>
              </div>
            </div>
          </div>

          <div class="absolute right-0 top-0 m-9 w-44 text-white">
            <div class="bg-[#01142330] p-3 rounded-lg mt-12">
              <p class="text-xs">// select a cell</p>
              <p class="text-xs">// type a number</p>

              <div class="grid grid-cols-3 gap-1 mt-4">
                <button v-for="n in 9" :key="n" @pointerdown.prevent="inputNumber(n)" :class="{
                  'bg-[#FEA55F] text-black': activeNum === n,
                  'bg-[#010C15] text-white': activeNum !== n,
                }" class="rounded-lg min-h-7 flex items-center justify-center text-xs font-medium">{{ n }}</button>
              </div>

              <button @pointerdown.prevent="eraseCell"
                class="w-full mt-1 rounded-lg min-h-7 flex items-center justify-center bg-[#010C15] text-white text-xs">
                ← erase
              </button>
            </div>

            <div class="mt-5 text-xs px-3">
              <p>// mistakes</p>
              <div class="flex gap-2 mt-3">
                <div v-for="i in 3" :key="i" class="w-3 h-3 rounded-full"
                  :class="i <= mistakes ? 'bg-[#E99287]' : 'bg-[#010C15] border border-[#43D9AD]'"></div>
              </div>
            </div>

            <button class="absolute -bottom-28 right-0 rounded-md p-2 border border-white text-white"
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

defineEmits(["skip"]);

const GAME_W = 580;
const GAME_H = 480;
const outerRef = ref(null);
const scale = ref(1);
const scaledWidth = computed(() => GAME_W * scale.value);
const scaledHeight = computed(() => GAME_H * scale.value);

function computeScale() {
  if (!outerRef.value) return;
  scale.value = Math.min(1, outerRef.value.offsetWidth / GAME_W);
}

let ro;

const board = ref([]);
const solution = ref([]);
const given = ref([]);
const errors = ref([]);
const selected = ref(null);
const mistakes = ref(0);
const completed = ref(false);
const gameOver = ref(false);
const activeNum = ref(null);

const flatBoard = computed(() => board.value.flat());

const selectedValue = computed(() => {
  if (!selected.value) return null;
  const { r, c } = selected.value;
  return board.value[r]?.[c] || null;
});

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isValidPlacement(b, r, c, num) {
  for (let i = 0; i < 9; i++) {
    if (b[r][i] === num || b[i][c] === num) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      if (b[br + dr][bc + dc] === num) return false;
    }
  }
  return true;
}

function fillBox(b, row, col) {
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let i = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      b[row + r][col + c] = nums[i++];
    }
  }
}

function solveSudoku(b) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (b[r][c] !== 0) continue;
      for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
        if (isValidPlacement(b, r, c, num)) {
          b[r][c] = num;
          if (solveSudoku(b)) return true;
          b[r][c] = 0;
        }
      }
      return false;
    }
  }
  return true;
}

function generatePuzzle() {
  const b = Array.from({ length: 9 }, () => Array(9).fill(0));
  [0, 3, 6].forEach((i) => fillBox(b, i, i));
  solveSudoku(b);
  const sol = b.map((r) => [...r]);
  const positions = shuffle(Array.from({ length: 81 }, (_, i) => i));
  for (let i = 0; i < 46; i++) {
    b[Math.floor(positions[i] / 9)][positions[i] % 9] = 0;
  }
  return { puzzle: b, solution: sol };
}

function newGame() {
  const { puzzle, solution: sol } = generatePuzzle();
  board.value = puzzle;
  solution.value = sol;
  given.value = puzzle.map((r) => r.map((v) => v !== 0));
  errors.value = Array.from({ length: 9 }, () => Array(9).fill(false));
  selected.value = null;
  mistakes.value = 0;
  completed.value = false;
  gameOver.value = false;
  activeNum.value = null;
}

function selectCell(r, c) {
  if (gameOver.value || completed.value) return;
  selected.value = { r, c };
}

function inputNumber(n) {
  if (!selected.value || gameOver.value || completed.value) return;
  const { r, c } = selected.value;
  if (given.value[r][c] || board.value[r][c] === n) return;

  activeNum.value = n;
  board.value[r][c] = n;

  if (solution.value[r][c] !== n) {
    errors.value[r][c] = true;
    mistakes.value++;
    if (mistakes.value >= 3) gameOver.value = true;
  } else {
    errors.value[r][c] = false;
    checkCompleted();
  }

  setTimeout(() => { activeNum.value = null; }, 200);
}

function eraseCell() {
  if (!selected.value || gameOver.value || completed.value) return;
  const { r, c } = selected.value;
  if (given.value[r][c]) return;
  board.value[r][c] = 0;
  errors.value[r][c] = false;
}

function checkCompleted() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board.value[r][c] !== solution.value[r][c]) return;
    }
  }
  completed.value = true;
}

function isRelated(r, c) {
  if (!selected.value) return false;
  const { r: sr, c: sc } = selected.value;
  if (r === sr || c === sc) return true;
  return (
    Math.floor(r / 3) === Math.floor(sr / 3) &&
    Math.floor(c / 3) === Math.floor(sc / 3)
  );
}

function cellClass(r, c) {
  const cls = ["sudoku-cell"];
  if (c < 8) cls.push((c + 1) % 3 === 0 ? "cell-br-box" : "cell-br");
  if (r < 8) cls.push((r + 1) % 3 === 0 ? "cell-bb-box" : "cell-bb");

  const isSel = selected.value?.r === r && selected.value?.c === c;
  if (isSel) {
    cls.push("cell-selected");
  } else if (isRelated(r, c)) {
    cls.push("cell-related");
  } else if (selectedValue.value && board.value[r][c] === selectedValue.value) {
    cls.push("cell-same-num");
  }

  if (errors.value[r][c]) cls.push("cell-error");
  else if (given.value[r][c]) cls.push("cell-given");
  else if (board.value[r][c]) cls.push("cell-user");

  return cls;
}

function handleKeydown(e) {
  const num = parseInt(e.key);
  if (num >= 1 && num <= 9) { inputNumber(num); return; }
  if (e.key === "Backspace" || e.key === "Delete") { eraseCell(); return; }
  const arrows = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (arrows.includes(e.key)) {
    e.preventDefault();
    if (!selected.value) { selected.value = { r: 4, c: 4 }; return; }
    let { r, c } = selected.value;
    if (e.key === "ArrowUp") r = Math.max(0, r - 1);
    if (e.key === "ArrowDown") r = Math.min(8, r + 1);
    if (e.key === "ArrowLeft") c = Math.max(0, c - 1);
    if (e.key === "ArrowRight") c = Math.min(8, c + 1);
    selected.value = { r, c };
  }
}

onMounted(() => {
  newGame();
  window.addEventListener("keydown", handleKeydown);
  computeScale();
  ro = new ResizeObserver(computeScale);
  ro.observe(outerRef.value);
});

onUnmounted(() => {
  ro?.disconnect();
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
#sudoku-game {
  width: 580px;
  height: 480px;
  border-radius: 8px;
  border: 1px solid #0c1616;
  background: linear-gradient(150deg,
      rgba(23, 85, 83, 0.7) 1.7%,
      rgba(67, 217, 173, 0.09) 81.82%);
  box-shadow: 0px 2px 0px 0px rgba(255, 255, 255, 0.3) inset;
  backdrop-filter: blur(32px);
}

.sudoku-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(9, 1fr);
  width: 306px;
  height: 306px;
  border: 2px solid rgba(67, 217, 173, 0.65);
  border-radius: 4px;
  overflow: hidden;
  background: #010c15;
}

.sudoku-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.1s;
  color: transparent;
}

.cell-br {
  border-right: 1px solid rgba(67, 217, 173, 0.2);
}

.cell-bb {
  border-bottom: 1px solid rgba(67, 217, 173, 0.2);
}

.cell-br-box {
  border-right: 2px solid rgba(67, 217, 173, 0.55);
}

.cell-bb-box {
  border-bottom: 2px solid rgba(67, 217, 173, 0.55);
}

.cell-selected {
  background-color: rgba(67, 217, 173, 0.22);
}

.cell-related {
  background-color: rgba(67, 217, 173, 0.06);
}

.cell-same-num {
  background-color: rgba(67, 217, 173, 0.13);
}

.cell-given {
  color: #43d9ad;
  font-weight: 600;
}

.cell-user {
  color: #ffffff;
}

.cell-error {
  color: #e99287;
  background-color: rgba(233, 146, 135, 0.15);
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
