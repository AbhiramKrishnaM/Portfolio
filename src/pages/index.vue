<template>
    <div class="relative">
        <SpaceTimeGrid v-if="showBackground" />
        <section id="hero" ref="heroRef"
            class="relative flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh_-_108px)] px-5 sm:pl-28 md:px-10 md:pl-28 lg:pl-10 lg:gap-8 xl:gap-16 2xl:gap-24 gap-10 pt-12 pb-28 sm:pb-12 lg:py-0">
            <HeroIntro :github-url="activeGameGithubUrl" />

            <div ref="terminalPanelRef" class="right-panel relative z-10 w-full lg:w-auto">
                <Transition name="panel-fade" mode="out-in">
                    <TerminalWindow v-if="view === 'cli'" key="cli" ref="terminalRef" :scene="terminalScene"
                        :selected-project="selectedProject.slug" @game-selected="launchGame"
                        @project-select="selectProject" />

                    <div v-else key="game">
                        <SnakeGame v-if="activeGame === 'snake'" @skip="exitGame" />
                        <SudokuGame v-else-if="activeGame === 'sudoku'" @skip="exitGame" />
                        <TetrisGame v-else-if="activeGame === 'tetris'" @skip="exitGame" />
                    </div>
                </Transition>
            </div>

            <div class="relative z-10 w-full lg:hidden" data-section-fallback="projects">
                <Transition name="card-swap" mode="out-in">
                    <ProjectCard :key="selectedProject.slug" :project="selectedProject" :index="selectedIdx"
                        :total="projectCount" @prev="stepProject(-1)" @next="stepProject(1)" />
                </Transition>
            </div>
        </section>

        <section id="projects" ref="pinRef" class="pin-section relative z-10 hidden lg:block" aria-label="Projects and stack">
            <div id="stack" ref="stackRef" class="stack-anchor" :style="{ top: STACK_ANCHOR_TOP }" aria-hidden="true" />
            <div
                class="sticky top-0 h-screen flex flex-row items-center justify-center px-5 md:px-10 lg:pl-32 lg:pr-20 xl:pl-36 min-[1672px]:pr-36 gap-8 xl:gap-16">
                <div ref="dockRef" class="terminal-dock shrink-0 w-full lg:w-[500px] xl:w-[580px] 2xl:w-[660px]"
                    data-story-anchor="dock" aria-hidden="true">
                </div>

                <div class="project-slot relative flex-1 min-w-0" data-story-anchor="slot">
                    <Transition name="card-reveal">
                        <div v-if="terminalScene === 'projects'" class="h-full">
                            <Transition name="card-swap" mode="out-in">
                                <ProjectCard :key="selectedProject.slug" :project="selectedProject" :index="selectedIdx"
                                    :total="projectCount" @prev="stepProject(-1)" @next="stepProject(1)" />
                            </Transition>
                        </div>
                    </Transition>
                    <Transition name="card-reveal">
                        <div v-if="terminalScene === 'stack'" class="stack-slot absolute inset-0 flex flex-col">
                            <p class="text-sm text-accent-variable">$ ls stack</p>
                            <h2 class="text-3xl text-white-gradient-01 mt-2">Stack</h2>
                            <p v-if="storyEnabled" class="text-xs text-gray-gradient-01 mt-2">// grab a package and throw it</p>
                            <ul v-if="storyEnabled" class="sr-only">
                                <li v-for="item in STACK" :key="item.id">{{ item.name }}</li>
                            </ul>
                            <StackGrid v-else class="mt-8" />
                        </div>
                    </Transition>
                </div>
            </div>
        </section>

        <StackSection class="lg:hidden" />
        <NodeModulesStory v-if="storyEnabled && showBackground" />

        <ExperienceSection />
        <AboutSection />
        <ContactSection />
        <SiteFooter />

        <ScrollCue />
    </div>
</template>

<script setup>
import { ref, defineAsyncComponent } from "vue";
import HeroIntro from "@/components/hero/HeroIntro.vue";
import TerminalWindow from "@/components/cli/TerminalWindow.vue";
import SnakeGame from "@/components/games/SnakeGame.vue";
import SudokuGame from "@/components/games/SudokuGame.vue";
import TetrisGame from "@/components/games/TetrisGame.vue";
import ScrollCue from "@/components/hero/ScrollCue.vue";
import ProjectCard from "@/components/projects/ProjectCard.vue";
import StackGrid from "@/components/stack/StackGrid.vue";
import StackSection from "@/components/sections/StackSection.vue";
import { STACK } from "@/data/stack.js";
import ExperienceSection from "@/components/sections/ExperienceSection.vue";
import AboutSection from "@/components/sections/AboutSection.vue";
import ContactSection from "@/components/sections/ContactSection.vue";
import SiteFooter from "@/components/sections/SiteFooter.vue";
import { useWhenIdle } from "@/composables/useWhenIdle.js";
import { useTerminalScroll } from "@/composables/useTerminalScroll.js";
import { useGameSwitcher } from "@/composables/useGameSwitcher.js";
import { useProjectSelection } from "@/composables/useProjectSelection.js";
import { useSectionSpy } from "@/composables/useSectionSpy.js";
import { useMediaQuery } from "@/composables/useMediaQuery.js";
import { STACK_ANCHOR_TOP, PIN_SCREENS } from "@/composables/storyline.js";

const SpaceTimeGrid = defineAsyncComponent(() => import("@/components/background/SpaceTimeGrid.vue"));
const NodeModulesStory = defineAsyncComponent(() => import("@/components/story/NodeModulesStory.vue"));

const heroRef = ref(null);
const terminalPanelRef = ref(null);
const dockRef = ref(null);
const pinRef = ref(null);
const stackRef = ref(null);
const pinHeight = `${PIN_SCREENS * 100}vh`;
const terminalRef = ref(null);

const showBackground = useWhenIdle();
const { terminalScene } = useTerminalScroll({ heroRef, panelRef: terminalPanelRef, dockRef, pinRef, stackRef });
const storyEnabled = useMediaQuery("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
const { view, activeGame, activeGameGithubUrl, launchGame, exitGame } = useGameSwitcher({ terminalRef, panelRef: terminalPanelRef });
const { selectedIdx, selectedProject, selectProject, stepProject, projectCount } = useProjectSelection(terminalScene);
useSectionSpy(["projects", "stack", "experience", "about", "contact"]);
</script>

<style scoped>
.right-panel {
    width: 100%;
    flex-shrink: 0;
}

.pin-section {
    height: v-bind(pinHeight);
}

.stack-anchor {
    position: absolute;
    left: 0;
    width: 1px;
    height: 1px;
    pointer-events: none;
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

    .project-slot {
        height: 460px;
        max-width: 500px;
    }
}

@media (min-width: 1280px) {
    .right-panel {
        width: 580px;
    }

    .project-slot {
        height: 480px;
        max-width: 580px;
    }
}

@media (min-width: 1536px) {
    .right-panel {
        width: 660px;
    }

    .project-slot {
        height: 500px;
        max-width: 660px;
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

.card-reveal-enter-active {
    transition:
        opacity 0.5s ease 0.25s,
        transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.25s;
}

.card-reveal-leave-active {
    transition:
        opacity 0.25s ease,
        transform 0.25s ease;
}

.card-reveal-enter-from,
.card-reveal-leave-to {
    opacity: 0;
    transform: translateX(24px);
}

.card-swap-enter-active,
.card-swap-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}

.card-swap-enter-from {
    opacity: 0;
    transform: translateY(8px);
}

.card-swap-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>
