<script setup>
import { onUnmounted, ref } from "vue";
import GooeyText from "./ui/GooeyText.vue";

const emits = defineEmits(["animation-complete"]);

const texts = [
  " ",
  "Frontend",
  "Development",
  "Is",
  "Awesome",
  ".",
  "..",
  "...",
];
const delayTimer = ref(null);

// Handle when GooeyText reaches the last text
function handleLastTextReached() {
  console.log("Last text reached, starting delay before redirect...");
  delayTimer.value = setTimeout(() => {
    console.log("Redirecting to landing page...");
    animationComplete();
  }, 1000);
}

function animationComplete() {
  emits("animation-complete");
}

// Cleanup timer on unmount
onUnmounted(() => {
  if (delayTimer.value) {
    clearTimeout(delayTimer.value);
  }
});
</script>

<template>
  <header class="h-screen flex items-center justify-center">
    <GooeyText
      :texts="texts"
      :morph-time="1.5"
      :cooldown-time="0.5"
      class-name="text-5xl text-white-gradient-01"
      @last-text-reached="handleLastTextReached"
    />
  </header>
</template>
