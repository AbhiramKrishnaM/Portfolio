<template>
  <div id="snake-game" class="relative p-3 min-w-[510px]">
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
          <div
            :class="{
              'bg-[#FEA55F]': highlightedKey === 'UP',
              'bg-[#010C15]': highlightedKey !== 'UP',
            }"
            class="rounded-lg min-h-7 flex items-center justify-center"
          >
            <img :src="Up" alt="Up arrow" />
          </div>
          <div></div>
          <div
            :class="{
              'bg-[#FEA55F]': highlightedKey === 'LEFT',
              'bg-[#010C15]': highlightedKey !== 'LEFT',
            }"
            class="rounded-lg min-h-7 flex items-center justify-center"
          >
            <img :src="Left" alt="Left arrow" />
          </div>
          <div
            :class="{
              'bg-[#FEA55F]': highlightedKey === 'DOWN',
              'bg-[#010C15]': highlightedKey !== 'DOWN',
            }"
            class="rounded-lg min-h-7 flex items-center justify-center"
          >
            <img :src="Down" alt="Down arrow" />
          </div>
          <div
            :class="{
              'bg-[#FEA55F]': highlightedKey === 'RIGHT',
              'bg-[#010C15]': highlightedKey !== 'RIGHT',
            }"
            class="rounded-lg min-h-7 flex items-center justify-center"
          >
            <img :src="Right" alt="Right arrow" />
          </div>
        </div>
      </div>

      <div class="mt-5 text-xs px-3">
        <p>// foot left</p>

        <div class="grid grid-cols-5 gap-1 mt-3">
          <img
            v-for="(food, index) in foodImages"
            :key="index"
            :src="food"
            alt="Snake food"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// vue
import { ref, onMounted, computed } from "vue";
// assets
import Green from "~/vectors/Green.svg";
import Blue from "~/vectors/Blue.svg";
import BoltDownLeft from "~/icons/bolt-down-left.svg";
import BoltDownRight from "~/icons/bolt-down-right.svg";
import BoltTopLeft from "~/icons/bolt-up-left.svg";
import BoltTopRight from "~/icons/bolt-up-right.svg";
import SnakeFoodImageSrc from "~/icons/snake-food.svg";
import Up from "~/icons/up.svg";
import Down from "~/icons/down.svg";
import Left from "~/icons/left.svg";
import Right from "~/icons/right.svg";
import ActiveSnakeFood from "~/icons/active-snake-food.svg";
import InActiveSnakeFood from "~/icons/inactive-snake-food.svg";

// state
const gameBoard = ref(null);
const gameRunning = ref(false);
const gameOver = ref(false);
const buttonText = ref("start-game"); // Initially set to "start-game"
const foodEatenCount = ref(0); // Track the number of foods eaten
const highlightedKey = ref(""); // Track the highlighted arrow key

// game configuration
const size = {
  width: 240,
  height: 406,
};
const unitSize = 14; // Updated unit size to 14px
const snakeColor = "#43D9AD";

// game variables
let running = false;
let xVelocity = 0;
let yVelocity = -unitSize; // Start moving upwards
let foodX;
let foodY;
let score = 0;
let snake = [];
let snakeFoodImage = new Image();
let foodLoaded = false;

// Speed control variables
let frameCounter = 0;
const speedFactor = 10; // Adjust this to control the snake's speed

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
  return images.reverse(); // Reverse the array to start from the bottom right
});

// functions
function startGame() {
  resetGame(); // Ensure game is reset before starting
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
        drawSnake(ctx);
        checkGameOver();
      }
      if (running) nextAnimationFrame(ctx);
      else {
        gameRunning.value = false;
        buttonText.value = "retry"; // Change the button text to "retry"
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
      foodLoaded = true; // Mark the food as loaded
    };
  } else {
    ctx.drawImage(snakeFoodImage, foodX, foodY, unitSize, unitSize);
  }
}

function moveSnake() {
  const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };
  snake.unshift(head);

  if (snake[0].x === foodX && snake[0].y === foodY) {
    foodEatenCount.value++; // Increment food eaten count
    if (foodEatenCount.value >= 15) {
      foodEatenCount.value = 0; // Reset the count after 15 foods
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

    // Calculate the opacity for the current segment
    const opacity = 1 - index / totalSegments;

    // Set the color with the calculated opacity
    ctx.fillStyle = `rgba(67, 217, 173, ${opacity})`;

    if (index === 0) {
      // Draw the head with a semicircle based on the direction
      ctx.beginPath();

      if (xVelocity > 0) {
        // Moving right
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
        // Moving left
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
        // Moving up
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
        // Moving down
        ctx.moveTo(x, y);
        ctx.lineTo(x + unitSize, y);
        ctx.arc(x + unitSize / 2, y, unitSize / 2, 0, Math.PI);
      }

      ctx.closePath();
      ctx.fill();
    } else {
      // Draw the body segments as squares with fading opacity
      ctx.fillRect(x, y, unitSize, unitSize);
    }
  });
}

function changeDirection(event) {
  const keyPressed = event.keyCode;
  const LEFT = 37,
    RIGHT = 39,
    UP = 38,
    DOWN = 40;
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

  // Remove the highlight after a short delay
  setTimeout(() => {
    highlightedKey.value = "";
  }, 200); // Highlight duration
}

function checkGameOver() {
  if (!snake[0]) return;

  switch (true) {
    case snake[0].x < 0:
    case snake[0].x >= size.width:
    case snake[0].y < 0:
    case snake[0].y >= size.height:
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
  foodEatenCount.value = 0; // Reset food count to restart the food images
  xVelocity = 0;
  yVelocity = -unitSize; // Start moving upwards
  initializeSnake();
  createFood(); // Ensure food is created initially
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
});
</script>

<style scoped>
#snake-game {
  width: 510px;
  height: 475px;
  border: 1px solid;
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
