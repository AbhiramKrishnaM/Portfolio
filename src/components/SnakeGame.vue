<template>
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

    <div class="m-6">
      <canvas
        ref="gameBoard"
        width="240"
        height="406"
        class="rounded-lg bg-theme-main-gradient"
      >
      </canvas>
    </div>

    <!-- width="239"
        height="405" -->
  </div>
</template>

<script setup>
// vue
import { ref, onMounted } from "vue";
// assets
import Green from "~/vectors/Green.svg";
import Blue from "~/vectors/Blue.svg";
import BoltDownLeft from "~/icons/bolt-down-left.svg";
import BoltDownRight from "~/icons/bolt-down-right.svg";
import BoltTopLeft from "~/icons/bolt-up-left.svg";
import BoltTopRight from "~/icons/bolt-up-right.svg";
import SnakeFood from "~/icons/snake-food.svg";

// state
const gameBoard = ref(null);

// actions
function loadGame() {
  const ctx = gameBoard.value.getContext("2d");

  const size = {
    width: gameBoard.value.width,
    height: gameBoard.value.height,
  };

  const snakeColor = "#43D9AD";
  const snakeBorder = "black";

  const unitSize = 20; // or 10

  let running = false;

  let xVelocity = unitSize;
  let yVelocity = 0;

  let foodX;
  let foodY;

  let score = 0;

  let snake = [
    {
      x: unitSize * 4,
      y: 0,
    },
    {
      x: unitSize * 3,
      y: 0,
    },
    {
      x: unitSize * 2,
      y: 0,
    },
    {
      x: unitSize,
      y: 0,
    },
    {
      x: 0,
      y: 0,
    },
  ];

  window.addEventListener("keydown", changeDirection);

  gameStart();
  createFood();
  drawFood();

  function gameStart() {}

  function nextTick() {}

  function clearBoard() {}

  function createFood() {
    function randomFood(min, max) {
      const randNum =
        Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
      return randNum;
    }

    foodX = randomFood(0, size.width - unitSize);
    foodY = randomFood(0, size.width - unitSize);
  }

  function drawFood() {
    var img = new Image();

    img.src = SnakeFood;

    img.onload = function () {
      ctx.drawImage(img, foodX, foodY, unitSize, unitSize);
    };
  }

  function moveSnake() {}

  function drawSnake() {}

  function changeDirection() {}

  function checkGameOver() {}

  function displayGameOver() {}

  function resetGame() {}
}

// hook
onMounted(() => {
  loadGame();
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
