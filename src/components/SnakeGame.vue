<template>
  <!-- Outer sizer: matches the visual footprint of the scaled game -->
  <div ref="outerRef" class="w-full">
    <div
      class="mx-auto overflow-visible"
      :style="{ width: scaledWidth + 'px', height: scaledHeight + 'px' }"
    >
      <div :style="{ transform: `scale(${scale})`, transformOrigin: 'top left', width: '510px', height: '475px' }">
        <div id="snake-game" class="relative p-3">
          <div class="top-left-fill -z-10"></div>
          <div class="bottom-left-fill -z-10"></div>

          <img
            id="green-vector"
            :src="Green"
            alt="Background halo"
            class="absolute left-7 -top-9 -z-10"
          />

          <img
            :src="Blue"
            alt="Background halo"
            class="absolute -right-13 -bottom-11 -z-10"
          />

          <img
            :src="BoltTopLeft"
            alt="Screw top left"
            class="absolute top-0 left-0 ml-3 mt-3"
          />

          <img
            :src="BoltTopRight"
            alt="Screw top right"
            class="absolute top-0 right-0 mr-3 mt-3"
          />

          <img
            :src="BoltDownLeft"
            alt="Screw bottom left"
            class="absolute bottom-0 left-0 ml-3 mb-3"
          />

          <img
            :src="BoltDownRight"
            alt="Screw bottom right"
            class="absolute bottom-0 right-0 mr-3 mb-3"
          />

          <div class="m-6 relative max-w-[240px]">
            <canvas
              ref="gameBoard"
              width="240"
              height="406"
              class="rounded-lg bg-theme-main-gradient"
            ></canvas>

            <div class="absolute top-3/4 left-0 w-full flex justify-center">
              <button
                v-if="!gameRunning"
                @click="startGame"
                class="rounded-md p-2 bg-[#FEA55F] text-black"
              >
                {{ buttonText }}
              </button>
            </div>
          </div>

          <div class="absolute right-0 top-0 m-9 w-44 text-white">
            <div class="bg-[#01142330] p-3 rounded-lg">
              <p class="text-xs">// use keyboard</p>
              <p class="text-xs">// arrows to play</p>

              <div id="keyboard-controls" class="grid grid-cols-3 gap-1 mt-4">
                <div></div>
                <button
                  @pointerdown.prevent="handleControlClick('UP')"
                  :class="{
                    'bg-[#FEA55F]': highlightedKey === 'UP',
                    'bg-[#010C15]': highlightedKey !== 'UP',
                  }"
                  class="rounded-lg min-h-7 flex items-center justify-center"
                >
                  <img :src="Up" alt="Up arrow" />
                </button>
                <div></div>
                <button
                  @pointerdown.prevent="handleControlClick('LEFT')"
                  :class="{
                    'bg-[#FEA55F]': highlightedKey === 'LEFT',
                    'bg-[#010C15]': highlightedKey !== 'LEFT',
                  }"
                  class="rounded-lg min-h-7 flex items-center justify-center"
                >
                  <img :src="Left" alt="Left arrow" />
                </button>
                <button
                  @pointerdown.prevent="handleControlClick('DOWN')"
                  :class="{
                    'bg-[#FEA55F]': highlightedKey === 'DOWN',
                    'bg-[#010C15]': highlightedKey !== 'DOWN',
                  }"
                  class="rounded-lg min-h-7 flex items-center justify-center"
                >
                  <img :src="Down" alt="Down arrow" />
                </button>
                <button
                  @pointerdown.prevent="handleControlClick('RIGHT')"
                  :class="{
                    'bg-[#FEA55F]': highlightedKey === 'RIGHT',
                    'bg-[#010C15]': highlightedKey !== 'RIGHT',
                  }"
                  class="rounded-lg min-h-7 flex items-center justify-center"
                >
                  <img :src="Right" alt="Right arrow" />
                </button>
              </div>
            </div>

            <div class="mt-5 text-xs px-3">
              <p>// food left</p>

              <div class="grid grid-cols-5 gap-1 mt-3">
                <img
                  v-for="(food, index) in foodImages"
                  :key="index"
                  :src="food"
                  alt="Snake food"
                />
              </div>
            </div>

            <button
              class="absolute -bottom-36 right-0 rounded-md p-2 border border-white text-white mt-auto"
              @click="$emit('skip')"
            >
              back
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// vue
import { ref, onMounted, onUnmounted, computed } from "vue";
// assets
import Green from "@/assets/vectors/Green.svg";
import Blue from "@/assets/vectors/Blue.svg";
import BoltDownLeft from "@/assets/icons/bolt-down-left.svg";
import BoltDownRight from "@/assets/icons/bolt-down-right.svg";
import BoltTopLeft from "@/assets/icons/bolt-up-left.svg";
import BoltTopRight from "@/assets/icons/bolt-up-right.svg";
import SnakeFoodImageSrc from "@/assets/icons/snake-food.svg";
import Up from "@/assets/icons/up.svg";
import Down from "@/assets/icons/down.svg";
import Left from "@/assets/icons/left.svg";
import Right from "@/assets/icons/right.svg";
import ActiveSnakeFood from "@/assets/icons/active-snake-food.svg";
import InActiveSnakeFood from "@/assets/icons/inactive-snake-food.svg";

// emits
defineEmits(["skip"]);

// scaling
const GAME_W = 510;
const GAME_H = 475;
const outerRef = ref(null);
const scale = ref(1);
const scaledWidth = computed(() => GAME_W * scale.value);
const scaledHeight = computed(() => GAME_H * scale.value);

function computeScale() {
  if (!outerRef.value) return;
  scale.value = Math.min(1, outerRef.value.offsetWidth / GAME_W);
}

let ro;

// state
const gameBoard = ref(null);
const gameRunning = ref(false);
const gameOver = ref(false);
const buttonText = ref("start-game");
const foodEatenCount = ref(0);
const highlightedKey = ref("");

// game configuration
const size = {
  width: 240,
  height: 406,
};
const unitSize = 14;

// game variables
let running = false;
let xVelocity = 0;
let yVelocity = -unitSize;
let foodX;
let foodY;
let score = 0;
let snake = [];
let snakeFoodImage = new Image();
let foodLoaded = false;

// Speed control variables
let frameCounter = 0;
const speedFactor = 10;

// Computed property to manage food images in the UI
const foodImages = computed(() => {
  const images = [];
  for (let i = 0; i < 15; i++) {
    if (i < foodEatenCount.value) {
      images.push(InActiveSnakeFood);
    } else {
      images.push(ActiveSnakeFood);
    }
  }
  return images.reverse();
});

// functions
function startGame() {
  resetGame();
  loadGame();
}

function initializeSnake() {
  const initialX = Math.floor(size.width / 2 / unitSize) * unitSize;
  const initialY = Math.floor(size.height / 2 / unitSize) * unitSize;

  snake = [
    { x: initialX, y: initialY },
    { x: initialX, y: initialY + unitSize },
    { x: initialX, y: initialY + 2 * unitSize },
    { x: initialX, y: initialY + 3 * unitSize },
    { x: initialX, y: initialY + 4 * unitSize },
  ];
}

function loadGame() {
  const ctx = gameBoard.value.getContext("2d");

  window.addEventListener("keydown", changeDirection);

  gameRunning.value = true;
  gameOver.value = false;
  running = true;

  createFood();
  nextAnimationFrame(ctx);
}

function nextAnimationFrame(ctx) {
  if (running) {
    requestAnimationFrame(() => {
      frameCounter++;
      if (frameCounter >= speedFactor) {
        frameCounter = 0;
        clearBoard(ctx);
        drawFood(ctx);
        moveSnake();
        checkGameOver();
        drawSnake(ctx);
      }
      if (running) nextAnimationFrame(ctx);
      else {
        gameRunning.value = false;
        buttonText.value = "retry";
      }
    });
  }
}

function clearBoard(ctx) {
  ctx.fillStyle = "#011627D6";
  ctx.fillRect(0, 0, size.width, size.height);
}

function createFood() {
  function randomFood(min, max) {
    return (
      Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize
    );
  }

  foodX = randomFood(0, size.width - unitSize);
  foodY = randomFood(0, size.height - unitSize);
}

function drawFood(ctx) {
  if (!foodLoaded) {
    snakeFoodImage.src = SnakeFoodImageSrc;
    snakeFoodImage.onload = () => {
      ctx.drawImage(snakeFoodImage, foodX, foodY, unitSize, unitSize);
      foodLoaded = true;
    };
  } else {
    ctx.drawImage(snakeFoodImage, foodX, foodY, unitSize, unitSize);
  }
}

function moveSnake() {
  const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };
  snake.unshift(head);

  if (snake[0].x === foodX && snake[0].y === foodY) {
    foodEatenCount.value++;
    if (foodEatenCount.value >= 15) {
      foodEatenCount.value = 0;
    }
    createFood();
  } else {
    snake.pop();
  }
}

function drawSnake(ctx) {
  const totalSegments = snake.length;

  snake.forEach((snakePart, index) => {
    const x = snakePart.x;
    const y = snakePart.y;

    const opacity = 1 - index / totalSegments;

    ctx.fillStyle = `rgba(67, 217, 173, ${opacity})`;

    if (index === 0) {
      ctx.beginPath();

      if (xVelocity > 0) {
        ctx.arc(
          x + unitSize / 2,
          y + unitSize / 2,
          unitSize / 2,
          0.5 * Math.PI,
          1.5 * Math.PI,
          true
        );
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + unitSize);
      } else if (xVelocity < 0) {
        ctx.arc(
          x + unitSize / 2,
          y + unitSize / 2,
          unitSize / 2,
          1.5 * Math.PI,
          0.5 * Math.PI,
          true
        );
        ctx.lineTo(x + unitSize, y + unitSize);
        ctx.lineTo(x + unitSize, y);
      } else if (yVelocity < 0) {
        ctx.moveTo(x, y + unitSize);
        ctx.lineTo(x + unitSize, y + unitSize);
        ctx.arc(
          x + unitSize / 2,
          y + unitSize,
          unitSize / 2,
          Math.PI,
          2 * Math.PI
        );
      } else if (yVelocity > 0) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + unitSize, y);
        ctx.arc(x + unitSize / 2, y, unitSize / 2, 0, Math.PI);
      }

      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(x, y, unitSize, unitSize);
    }
  });
}

function handleControlClick(direction) {
  if (!gameRunning.value) return;
  const goingUp = yVelocity === -unitSize;
  const goingDown = yVelocity === unitSize;
  const goingRight = xVelocity === unitSize;
  const goingLeft = xVelocity === -unitSize;

  switch (direction) {
    case "UP":
      if (!goingDown) { xVelocity = 0; yVelocity = -unitSize; highlightedKey.value = "UP"; }
      break;
    case "DOWN":
      if (!goingUp) { xVelocity = 0; yVelocity = unitSize; highlightedKey.value = "DOWN"; }
      break;
    case "LEFT":
      if (!goingRight) { xVelocity = -unitSize; yVelocity = 0; highlightedKey.value = "LEFT"; }
      break;
    case "RIGHT":
      if (!goingLeft) { xVelocity = unitSize; yVelocity = 0; highlightedKey.value = "RIGHT"; }
      break;
  }
  setTimeout(() => { highlightedKey.value = ""; }, 200);
}

function changeDirection(event) {
  const keyPressed = event.keyCode;
  const LEFT = 37,
    RIGHT = 39,
    UP = 38,
    DOWN = 40;

  if ([LEFT, RIGHT, UP, DOWN].includes(keyPressed)) {
    event.preventDefault();
  }
  const goingUp = yVelocity === -unitSize;
  const goingDown = yVelocity === unitSize;
  const goingRight = xVelocity === unitSize;
  const goingLeft = xVelocity === -unitSize;

  switch (true) {
    case keyPressed === LEFT && !goingRight:
      xVelocity = -unitSize;
      yVelocity = 0;
      highlightedKey.value = "LEFT";
      break;

    case keyPressed === UP && !goingDown:
      xVelocity = 0;
      yVelocity = -unitSize;
      highlightedKey.value = "UP";
      break;

    case keyPressed === RIGHT && !goingLeft:
      xVelocity = unitSize;
      yVelocity = 0;
      highlightedKey.value = "RIGHT";
      break;

    case keyPressed === DOWN && !goingUp:
      xVelocity = 0;
      yVelocity = unitSize;
      highlightedKey.value = "DOWN";
      break;

    default:
      break;
  }

  setTimeout(() => {
    highlightedKey.value = "";
  }, 200);
}

function checkGameOver() {
  if (!snake[0]) return;

  switch (true) {
    case snake[0].x < 0:
    case snake[0].x + unitSize > size.width:
    case snake[0].y < 0:
    case snake[0].y + unitSize > size.height:
      running = false;
      break;

    default:
      for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
          running = false;
        }
      }
      break;
  }
}

function resetGame() {
  score = 0;
  foodEatenCount.value = 0;
  xVelocity = 0;
  yVelocity = -unitSize;
  initializeSnake();
  createFood();
  gameRunning.value = false;
  gameOver.value = false;
}

// hook
onMounted(() => {
  const ctx = gameBoard.value.getContext("2d");
  initializeSnake();
  createFood();
  drawSnake(ctx);
  drawFood(ctx);

  computeScale();
  ro = new ResizeObserver(computeScale);
  ro.observe(outerRef.value);
});

onUnmounted(() => {
  ro?.disconnect();
  window.removeEventListener("keydown", changeDirection);
});
</script>

<style scoped>
#snake-game {
  width: 510px;
  height: 475px;
  border-radius: 8px;
  border: 1px solid #0c1616;
  background: linear-gradient(
    150deg,
    rgba(23, 85, 83, 0.7) 1.7%,
    rgba(67, 217, 173, 0.09) 81.82%
  );
  box-shadow: 0px 2px 0px 0px rgba(255, 255, 255, 0.3) inset;
  backdrop-filter: blur(32px);
}

.start-button {
  position: absolute;
  bottom: 20px;
  right: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background-color: #43d9ad;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

.start-button:hover {
  background-color: #3ab08c;
}

.top-left-fill,
.bottom-left-fill,
.bottom-right-fill {
  position: absolute;
  width: 100px;
  height: 100px;
  opacity: 1;
  filter: blur(70px);
}

.top-left-fill {
  top: 27;
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
