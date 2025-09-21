<template>
  <div class="relative" :class="className">
    <svg class="absolute h-0 w-0" aria-hidden="true" focusable="false">
      <defs>
        <filter id="threshold">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 255 -140"
          />
        </filter>
      </defs>
    </svg>

    <div
      class="flex items-center justify-center"
      style="filter: url(#threshold)"
    >
      <span
        ref="text1Ref"
        class="absolute inline-block select-none text-center text-6xl md:text-[60pt] text-foreground"
        :class="textClassName"
      />
      <span
        ref="text2Ref"
        class="absolute inline-block select-none text-center text-6xl md:text-[60pt] text-foreground"
        :class="textClassName"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// Props
const props = defineProps({
  texts: {
    type: Array,
    required: true,
  },
  morphTime: {
    type: Number,
    default: 1,
  },
  cooldownTime: {
    type: Number,
    default: 0.25,
  },
  className: {
    type: String,
    default: "",
  },
  textClassName: {
    type: String,
    default: "",
  },
});

// Emits
const emits = defineEmits(["cycle-complete", "last-text-reached"]);

// Refs
const text1Ref = ref(null);
const text2Ref = ref(null);

// Animation variables
let textIndex = 0;
let time = new Date();
let morph = 0;
let cooldown = props.cooldownTime;
let animationId = null;
let cyclesCompleted = 0;

const setMorph = (fraction) => {
  if (text1Ref.value && text2Ref.value) {
    text2Ref.value.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    text2Ref.value.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

    fraction = 1 - fraction;
    text1Ref.value.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    text1Ref.value.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
  }
};

const doCooldown = () => {
  morph = 0;
  if (text1Ref.value && text2Ref.value) {
    text2Ref.value.style.filter = "";
    text2Ref.value.style.opacity = "100%";
    text1Ref.value.style.filter = "";
    text1Ref.value.style.opacity = "0%";
  }
};

const doMorph = () => {
  morph -= cooldown;
  cooldown = 0;
  let fraction = morph / props.morphTime;

  if (fraction > 1) {
    cooldown = props.cooldownTime;
    fraction = 1;
  }

  setMorph(fraction);
};

const animate = () => {
  animationId = requestAnimationFrame(animate);
  const newTime = new Date();
  const shouldIncrementIndex = cooldown > 0;
  const dt = (newTime.getTime() - time.getTime()) / 1000;
  time = newTime;

  cooldown -= dt;

  if (cooldown <= 0) {
    if (shouldIncrementIndex) {
      textIndex = (textIndex + 1) % props.texts.length;
      if (text1Ref.value && text2Ref.value) {
        text1Ref.value.textContent =
          props.texts[textIndex % props.texts.length];
        text2Ref.value.textContent =
          props.texts[(textIndex + 1) % props.texts.length];
      }

      // Check if we've reached the last text
      if (textIndex === props.texts.length - 1) {
        emits("last-text-reached");
      }

      // Check if we've completed a full cycle (back to the first text)
      if (textIndex === 0) {
        cyclesCompleted++;
        emits("cycle-complete", cyclesCompleted);
      }
    }
    doMorph();
  } else {
    doCooldown();
  }
};

onMounted(() => {
  // Initialize the animation
  if (text1Ref.value && text2Ref.value && props.texts.length > 0) {
    text1Ref.value.textContent = props.texts[textIndex % props.texts.length];
    text2Ref.value.textContent =
      props.texts[(textIndex + 1) % props.texts.length];
  }
  animate();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
</script>
