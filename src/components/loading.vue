<script setup>
import { onMounted } from "vue";
import { gsap } from "gsap";
import SplitType from "split-type";

const emits = defineEmits(["animation-complete"]);
// hooks
onMounted(() => {
  initialize();
});

// methods
function initialize() {
  const heading = new SplitType("#name-loading");

  const tl = gsap.timeline({ onComplete: animationComplete });

  tl.to(".char", {
    y: 0,
    stagger: 0.05,
    delay: 0.2,
    duration: 0.1,
  }).addPause(4);
}

function animationComplete() {
  emits("animation-complete");
}
</script>

<template>
  <header class="h-screen flex items-center justify-center">
    <h1 id="name-loading" class="text-5xl text-white-gradient-01">
      Abhiram_Krishna<span id="dot" class="cursor-pointer">.</span>M
    </h1>
  </header>
</template>
