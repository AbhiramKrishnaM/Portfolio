<template>
  <div class="relative z-10 w-full lg:w-auto text-center lg:text-left">
    <div id="section-1" class="text-white-gradient-01 font-normal">
      <p class="text-base md:text-lg">Hi all, I am</p>
      <h1 class="text-4xl md:text-5xl lg:text-5xl xl:text-6xl">
        Abhiram Kris<button type="button" class="theme-toggle-h"
          :class="{ 'theme-toggle-h--flipped': theme === 'light' }" data-cursor="toggle theme"
          aria-label="Toggle light and dark theme" @click="toggleTheme">h</button>na M
      </h1>
      <HackingText />
    </div>

    <div id="section-2" class="mt-6">
      <Transition name="github-link">
        <a v-if="githubUrl" :href="githubUrl" target="_blank"
          class="mb-2.5 text-accent-sub flex font-medium justify-center lg:justify-start">
          const
          <div class="text-accent-variable ml-2">githubLink</div>
          <div class="text-white-gradient-01 mx-2">=</div>
          <div class="text-accent-url">
            "{{ githubUrl }}"
          </div>
        </a>
      </Transition>

      <ul class="text-gray-gradient-01 font-normal flex flex-col items-center lg:items-start">
        <li>// open the terminal and explore.</li>
        <li>// type /game to play a mini-game.</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import HackingText from "@/components/hero/HackingText.vue";
import { useTheme } from "@/composables/useTheme.js";

defineProps({
  githubUrl: {
    type: String,
    default: null,
  },
});

const { theme, toggleTheme } = useTheme();
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
