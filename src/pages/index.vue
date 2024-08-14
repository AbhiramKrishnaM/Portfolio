<template>
  <div class="flex items-center justify-center h-full gap-92">
    <div>
      <div id="section-1" class="text-white-gradient-01 font-normal">
        <h6 class="text-lg">Hi all, I am</h6>
        <h1 class="text-6xl">Abhiram Krishna M</h1>
        <div class="text-3xl text-accent-sub hacking-text mt-3">
          <span>></span>
          <div class="hacking-container">
            <div
              v-for="(char, index) in currentText"
              :key="index"
              class="letter-container"
            >
              <div class="random-top">{{ randomCharsTop[index] }}</div>
              <div class="main-letter">{{ char }}</div>
              <div class="random-bottom">{{ randomCharsBottom[index] }}</div>
            </div>
          </div>
        </div>
      </div>

      <div id="section-2" class="mt-82">
        <ul class="text-gray-gradient-01 font-normal">
          <li>// complete the game to continue.</li>
          <li>// you can also see it on my github page.</li>
        </ul>

        <a
          href="https://github.com/AbhiramKrishnaM/snake-game-starter"
          target="_blank"
          class="mt-2.5 text-accent-sub flex font-medium"
        >
          const
          <div class="text-accent-variable ml-2">githubLink</div>
          <div class="text-white mx-2">=</div>
          <div class="text-accent-url">
            "https://github.com/AbhiramKrishnaM/snake-game-starter"
          </div>
        </a>
      </div>
    </div>

    <SnakeGame />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import SnakeGame from "@/components/SnakeGame.vue";

// Constants
const texts = [
  "Software Engineer",
  "Coding Enthusiast",
  "Guitarist",
  "Football Lover",
];
const maxLength = Math.max(...texts.map((t) => t.length));
const INTERVAL_DELAY = 150;
const CYCLE_DURATION = 10;
const INITIAL_DISPLAY_DURATION = 2000;

// State
let currentTextIndex = 0;
const currentText = ref(padText(texts[currentTextIndex]));
const randomCharsTop = ref([]);
const randomCharsBottom = ref([]);
let cyclingInterval = null;

// Utility Functions
const randomChar = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]|:;<>,.?/";
  return chars[Math.floor(Math.random() * chars.length)];
};

function padText(word) {
  return word
    .padEnd(maxLength, " ")
    .split("")
    .map((char) => (char === " " ? "\u200B" : char));
}

function generateRandomChars() {
  randomCharsTop.value = generateRandomArray();
  randomCharsBottom.value = generateRandomArray();
}

function generateRandomArray() {
  return currentText.value.map(() => randomChar());
}

// Main Functionality
function startCycling() {
  let cycles = 0;
  const nextText = padText(texts[(currentTextIndex + 1) % texts.length]);

  cyclingInterval = setInterval(() => {
    randomCharsTop.value = generateRandomArray();
    currentText.value = [...randomCharsBottom.value];
    randomCharsBottom.value = generateRandomArray();

    cycles++;
    if (cycles >= CYCLE_DURATION) {
      clearInterval(cyclingInterval);
      currentText.value = nextText;
      generateRandomChars();
      currentTextIndex = (currentTextIndex + 1) % texts.length;
      setTimeout(startCycling, INITIAL_DISPLAY_DURATION);
    }
  }, INTERVAL_DELAY);
}

// Lifecycle Hooks
onMounted(() => {
  generateRandomChars();
  setTimeout(startCycling, INITIAL_DISPLAY_DURATION);
});

onUnmounted(() => {
  clearInterval(cyclingInterval);
});
</script>

<style scoped>
.hacking-text {
  display: flex;
  align-items: center;
}

.hacking-container {
  display: flex;
  margin-left: 0.5rem;
  letter-spacing: -0.05em;
}

.letter-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 0.8em;
  overflow: hidden;
  position: relative;
}

.random-top,
.random-bottom {
  font-size: 0.35em;
  color: gray;
}

.main-letter {
  font-size: 1em;
}
</style>
