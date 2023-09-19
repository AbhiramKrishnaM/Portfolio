<script setup>
import { onMounted } from "vue";
import gsap from "gsap";
import { RoughEase } from "gsap/EasePack";
import { TextPlugin } from "gsap/TextPlugin";

import { useAdditional } from "../composables/additional";

const emits = defineEmits(["animation-complete"]);

const { underConstructionPage } = useAdditional();

// hooks
onMounted(() => {
  gsap.registerPlugin(TextPlugin, RoughEase);

  cursorAnimate();
  animateWords();
});

// methods
function cursorAnimate() {
  gsap.from("#cursor", {
    opacity: 0,
    ease: "power2.inOut",
    repeat: -1,
  });
}

function animateWords() {
  let masterTl = gsap.timeline({ repeat: -1 });

  underConstructionPage.value.sentences.forEach((sentence) => {
    let tl = gsap.timeline({ repeat: 1, yoyo: true, repeatDelay: 1 });
    tl.to("#sentence", { duration: 3.6, text: sentence, ease: "none" });

    masterTl.add(tl);
  });
}
</script>
<template>
  <h1 id="title" class="text-4xl font-medium text-center leading-loose">
    <span id="sentence"></span>
    <span id="cursor">|</span>
  </h1>
</template>
