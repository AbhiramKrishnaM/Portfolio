<template>
  <div class="text-xl md:text-2xl lg:text-3xl text-accent-sub hacking-text mt-3 justify-center lg:justify-start">
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
</template>

<script setup>
import { useHackingText } from "@/composables/useHackingText.js";
import { TAGLINES } from "@/data/profile.js";

const { currentText, randomCharsTop, randomCharsBottom } = useHackingText(TAGLINES);
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
