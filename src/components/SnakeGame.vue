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

  function gameStart() {
    running = true;

    createFood();
    drawFood();

    nextTick();
  }

  function nextTick() {
    if (running) {
      setTimeout(() => {
        clearBoard();
        drawFood();
        moveSnake();
        drawSnake();
        checkGameOver();
        nextTick();
      }, 75);
    } else {
      displayGameOver();
    }
  }

  function clearBoard() {
    ctx.fillStyle = "#011627D6";
    ctx.fillRect(0, 0, size.width, size.height);
  }

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

  function moveSnake() {
    const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };

    snake.unshift(head);

    if (snake[0].x === foodX && snake[0].y === foodY) {
      createFood();
    } else {
      snake.pop();
    }
  }

  function drawSnake() {
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorder;

    snake.forEach((snakePart) => {
      ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
      ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);
    });
  }

  function changeDirection(event) {
    const keyPressed = event.keyCode;

    const LEFT = 37;
    const RIGHT = 39;
    const UP = 38;
    const DOWN = 40;

    const goingUp = yVelocity === -unitSize;
    const goingDown = yVelocity === unitSize;
    const goingRight = xVelocity === unitSize;
    const goingLeft = xVelocity === -unitSize;

    switch (true) {
      case keyPressed === LEFT && !goingRight:
        xVelocity = -unitSize;
        yVelocity = 0;
        break;

      case keyPressed === UP && !goingDown:
        xVelocity = 0;
        yVelocity = -unitSize;
        break;
      case keyPressed === RIGHT && !goingLeft:
        xVelocity = unitSize;
        yVelocity = 0;
        break;
      case keyPressed === DOWN && !goingUp:
        xVelocity = 0;
        yVelocity = unitSize;
        break;

      default:
        break;
    }
  }

  function checkGameOver() {
    switch (true) {
      case snake[0].x < 0:
        running = false;
        break;

      case snake[0].x >= size.width:
        running = false;
        break;

      case snake[0].y < 0:
        running = false;
        break;

      case snake[0].y >= size.height:
        running = false;
        break;
    }

    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
        running = false;
      }
    }
  }

  function displayGameOver() {
    ctx.font = "50px";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", size.width / 2, size.height / 2);
  }

  function resetGame() {
    gameStart();
  }
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
