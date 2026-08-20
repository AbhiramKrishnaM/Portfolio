<template>
    <div class="relative">
        <SpaceTimeGrid v-if="showBackground" />
        <section ref="heroRef"
            class="relative flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh_-_108px)] px-5 md:px-10 lg:gap-8 xl:gap-16 2xl:gap-24 gap-10 py-12 lg:py-0">
            <IcosahedronBackground v-if="showBackground && SHOW_ICOSAHEDRON" />
            <div class="relative z-10 w-full lg:w-auto text-center lg:text-left">
                <div id="section-1" class="text-white-gradient-01 font-normal">
                    <p class="text-base md:text-lg">Hi all, I am</p>
                    <h1 class="text-4xl md:text-5xl lg:text-5xl xl:text-6xl">
                        Abhiram Kris<button type="button" class="theme-toggle-h"
                            :class="{ 'theme-toggle-h--flipped': theme === 'light' }" data-cursor="toggle theme"
                            aria-label="Toggle light and dark theme" @click="toggleTheme">h</button>na M
                    </h1>
                    <div
                        class="text-xl md:text-2xl lg:text-3xl text-accent-sub hacking-text mt-3 justify-center lg:justify-start">
                        <span>&gt;</span>
                        <div class="hacking-container">
                            <div v-for="(char, index) in currentText" :key="index" class="letter-container">
                                <div class="random-top">
                                    {{ randomCharsTop[index] }}
                                </div>
                                <div class="main-letter">{{ char }}</div>
                                <div class="random-bottom">
                                    {{ randomCharsBottom[index] }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="section-2" class="mt-6">
                    <Transition name="github-link">
                        <a v-if="activeGameGithubUrl" :href="activeGameGithubUrl" target="_blank"
                            class="mb-2.5 text-accent-sub flex font-medium justify-center lg:justify-start">
                            const
                            <div class="text-accent-variable ml-2">githubLink</div>
                            <div class="text-white-gradient-01 mx-2">=</div>
                            <div class="text-accent-url">
                                "{{ activeGameGithubUrl }}"
                            </div>
                        </a>
                    </Transition>

                    <ul class="text-gray-gradient-01 font-normal flex flex-col items-center lg:items-start">
                        <li>// open the terminal and explore.</li>
                        <li>// type /game to play a mini-game.</li>
                    </ul>
                </div>
            </div>

            <div ref="terminalPanelRef" class="right-panel relative z-10 w-full lg:w-auto">
                <Transition name="panel-fade" mode="out-in">
                    <TerminalWindow v-if="view === 'cli'" key="cli" ref="terminalRef" @game-selected="launchGame" />

                    <div v-else key="game">
                        <SnakeGame v-if="activeGame === 'snake'" @skip="exitGame" />
                        <SudokuGame v-else-if="activeGame === 'sudoku'" @skip="exitGame" />
                        <TetrisGame v-else-if="activeGame === 'tetris'" @skip="exitGame" />
                    </div>
                </Transition>
            </div>
        </section>

        <section class="relative flex flex-col items-start justify-center min-h-screen px-5 md:px-10 lg:px-20">
            <div ref="dockRef" class="terminal-dock w-full lg:w-[500px] xl:w-[580px] 2xl:w-[660px]" aria-hidden="true">
            </div>
        </section>

        <ScrollCue />
    </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, onMounted, onUnmounted, nextTick } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TerminalWindow from "@/components/cli/TerminalWindow.vue";
import SnakeGame from "@/components/SnakeGame.vue";
import SudokuGame from "@/components/SudokuGame.vue";
import TetrisGame from "@/components/TetrisGame.vue";
import ScrollCue from "@/components/ScrollCue.vue";
import { GAME_REGISTRY } from "@/composables/useCLI.js";
import { useTheme } from "@/composables/useTheme.js";

gsap.registerPlugin(ScrollTrigger);

const IcosahedronBackground = defineAsyncComponent(() =>
    import("@/components/IcosahedronBackground.vue")
);
const SpaceTimeGrid = defineAsyncComponent(() =>
    import("@/components/SpaceTimeGrid.vue")
);
const showBackground = ref(false);
// Hidden for now while SpaceTimeGrid is the primary background — flip back
// to true to bring the icosahedron/solar-system scene back.
const SHOW_ICOSAHEDRON = false;

const { theme, toggleTheme } = useTheme();

const view = ref("cli");
const activeGame = ref(null);
const terminalRef = ref(null);

const heroRef = ref(null);
const terminalPanelRef = ref(null);
const dockRef = ref(null);
let terminalScrollMM = null;

const activeGameGithubUrl = computed(() => {
    if (!activeGame.value) return null;
    return (
        GAME_REGISTRY.find((g) => g.id === activeGame.value)?.githubUrl ?? null
    );
});

function launchGame(gameId) {
    activeGame.value = gameId;
    view.value = "game";
}

function exitGame() {
    const prev = activeGame.value;
    view.value = "cli";
    activeGame.value = null;
    nextTick(() => {
        terminalRef.value?.onGameExit(prev);
    });
}

const texts = ["Fullstack Engineer", "Coding Enthusiast", "Guitarist"];
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

function bezierPoint(t, p1, p2, dx, dy) {
    const mt = 1 - t;
    const a = 3 * mt * mt * t;
    const b = 3 * mt * t * t;
    const c = t * t * t;
    return {
        x: a * p1.x + b * p2.x + c * dx,
        y: a * p1.y + b * p2.y + c * dy,
    };
}

function setupTerminalMotionPath() {
    terminalScrollMM?.revert();
    terminalScrollMM = gsap.matchMedia();

    terminalScrollMM.add("(min-width: 1024px)", () => {
        if (!heroRef.value || !terminalPanelRef.value || !dockRef.value) return;

        const startRect = terminalPanelRef.value.getBoundingClientRect();
        const dockRect = dockRef.value.getBoundingClientRect();
        const dx = (dockRect.left + dockRect.width / 2) - (startRect.left + startRect.width / 2);
        const dy = (dockRect.top + dockRect.height / 2) - (startRect.top + startRect.height / 2);
        const p1 = { x: 0, y: dy * 0.6 };
        const p2 = { x: dx * 0.4, y: dy * 0.95 };

        const progress = { value: 0 };
        const tween = gsap.to(progress, {
            value: 1,
            ease: "none",
            onUpdate: () => {
                const point = bezierPoint(progress.value, p1, p2, dx, dy);
                gsap.set(terminalPanelRef.value, { x: point.x, y: point.y });
            },
            scrollTrigger: {
                trigger: heroRef.value,
                start: "top top",
                end: "bottom top",
                scrub: 1,
            },
        });

        return () => {
            tween.scrollTrigger?.kill();
            tween.kill();
        };
    });
    ScrollTrigger.refresh();
}

onMounted(() => {
    generateRandomChars();
    setTimeout(startCycling, INITIAL_DISPLAY_DURATION);

    if (typeof requestIdleCallback === "function") {
        requestIdleCallback(() => { showBackground.value = true; }, { timeout: 1500 });
    } else {
        setTimeout(() => { showBackground.value = true; }, 200);
    }
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady.then(() => nextTick(setupTerminalMotionPath));
});

onUnmounted(() => {
    clearInterval(cyclingInterval);
    terminalScrollMM?.revert();
});
</script>

<style scoped>
.theme-toggle-h {
    display: inline-block;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    line-height: inherit;
    transform: rotate(0deg);
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.theme-toggle-h--flipped {
    transform: rotate(180deg);
}

.right-panel {
    width: 100%;
    flex-shrink: 0;
}

.terminal-dock {
    min-height: 420px;
    visibility: hidden;
    pointer-events: none;
}

@media (min-width: 1024px) {
    .right-panel {
        width: 500px;
    }
}

@media (min-width: 1280px) {
    .right-panel {
        width: 580px;
    }
}

@media (min-width: 1536px) {
    .right-panel {
        width: 660px;
    }
}

.panel-fade-enter-active,
.panel-fade-leave-active {
    transition:
        opacity 0.3s ease,
        transform 0.3s ease;
}

.panel-fade-enter-from {
    opacity: 0;
    transform: translateY(8px);
}

.panel-fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

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
