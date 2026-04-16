<template>
  <div class="relative flex items-center justify-center h-full gap-92">
    <!-- ── Left: intro ───────────────────────────────────────────────── -->
    <div>
      <div id="section-1" class="text-white-gradient-01 font-normal">
        <h6 class="text-lg">Hi all, I am</h6>
        <h1 class="text-6xl">Abhiram Krishna M</h1>
        <div class="text-3xl text-accent-sub hacking-text mt-3">
          <span>&gt;</span>
          <div class="hacking-container">
            <div v-for="(char, index) in currentText" :key="index" class="letter-container">
              <div class="random-top">{{ randomCharsTop[index] }}</div>
              <div class="main-letter">{{ char }}</div>
              <div class="random-bottom">{{ randomCharsBottom[index] }}</div>
            </div>
          </div>
        </div>
      </div>

      <div id="section-2" class="mt-6">
        <Transition name="github-link">
          <a
            v-if="activeGameGithubUrl"
            :href="activeGameGithubUrl"
            target="_blank"
            class="mb-2.5 text-accent-sub flex font-medium"
          >
            const
            <div class="text-accent-variable ml-2">githubLink</div>
            <div class="text-white mx-2">=</div>
            <div class="text-accent-url">"{{ activeGameGithubUrl }}"</div>
          </a>
        </Transition>

        <ul class="text-gray-gradient-01 font-normal">
          <li>// open the terminal and explore.</li>
          <li>// type /game to play a mini-game.</li>
        </ul>
      </div>
    </div>

    <!-- ── Right: CLI terminal ↔ game ───────────────────────────────── -->
    <div class="right-panel">
      <Transition name="panel-fade" mode="out-in">
        <!-- Terminal -->
        <TerminalWindow v-if="view === 'cli'" key="cli" ref="terminalRef" @game-selected="launchGame" />

        <!-- Active game slot -->
        <div v-else key="game">
          <SnakeGame v-if="activeGame === 'snake'" @skip="exitGame" />
          <!-- Register additional game components here as they are added -->
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import TerminalWindow from "@/components/cli/TerminalWindow.vue";
import SnakeGame from "@/components/SnakeGame.vue";
import { GAME_REGISTRY } from "@/composables/useCLI.js";

// ─── view state ──────────────────────────────────────────────────────────────
/** 'cli' | 'game' */
const view = ref("cli");
const activeGame = ref(null);
const terminalRef = ref(null);

const activeGameGithubUrl = computed(() => {
  if (!activeGame.value) return null;
  return GAME_REGISTRY.find((g) => g.id === activeGame.value)?.githubUrl ?? null;
});

function launchGame(gameId) {
  activeGame.value = gameId;
  view.value = "game";
}

function exitGame() {
  const prev = activeGame.value;
  view.value = "cli";
  // Let the terminal know which game was exited so it can add a context line
  nextTick(() => {
    terminalRef.value?.onGameExit(prev);
  });
}

// ─── hacking text animation ──────────────────────────────────────────────────
const texts = ["Software Engineer", "Coding Enthusiast", "Guitarist"];
const maxLength = Math.max(...texts.map((t) => t.length));
const INTERVAL_DELAY = 150;
const CYCLE_DURATION = 10;
const INITIAL_DISPLAY_DURATION = 2000;

let currentTextIndex = 0;
const currentText = ref(padText(texts[currentTextIndex]));
const randomCharsTop = ref([]);
const randomCharsBottom = ref([]);
let cyclingInterval = null;

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

onMounted(() => {
  generateRandomChars();
  setTimeout(startCycling, INITIAL_DISPLAY_DURATION);
});

onUnmounted(() => {
  clearInterval(cyclingInterval);
});
</script>

<style scoped>
.right-panel {
  /* Keeps the right column stable during transitions so left text doesn't shift */
  width: 660px;
  flex-shrink: 0;
}

/* ── panel fade transition ──────────────────────────────────────────────── */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.panel-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── hacking text ───────────────────────────────────────────────────────── */
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

/* ── github link transition ─────────────────────────────────────────────── */
.github-link-enter-active {
  animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.github-link-leave-active {
  animation: slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
