<template>
  <div class="flex items-start gap-[4px] my-2 select-none">
    <template v-for="(char, ci) in chars" :key="ci">
      <!-- word gap -->
      <div v-if="char === ' '" class="w-[10px]" />

      <!-- glyph -->
      <div v-else-if="GLYPHS[char]" class="flex flex-col gap-[2px]">
        <div v-for="(row, ri) in GLYPHS[char]" :key="ri" class="flex gap-[2px]">
          <span
            v-for="(bit, bi) in row"
            :key="bi"
            class="pixel"
            :class="bit === '1' ? 'pixel-on' : 'pixel-off'"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  text: { type: String, required: true },
});

const chars = props.text.split("");

/**
 * 5-wide × 7-tall bitmap font.
 * To add a character: add a key with 7 strings of exactly 5 chars ('0' or '1').
 */
const GLYPHS = {
  // ── uppercase ──────────────────────────────────────────────────────────────
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  M: ["10001", "11011", "10101", "10001", "10001", "10001", "10001"],

  // ── lowercase ──────────────────────────────────────────────────────────────
  b: ["10000", "10000", "11110", "10001", "10001", "10001", "11110"],
  h: ["10000", "10000", "11110", "10001", "10001", "10001", "10001"],
  i: ["00100", "00000", "00100", "00100", "00100", "00100", "00100"],
  r: ["00000", "00000", "11110", "10000", "10000", "10000", "10000"],
  a: ["00000", "00000", "01110", "00001", "01111", "10001", "01111"],
  m: ["00000", "00000", "11011", "10101", "10101", "10001", "10001"],
  s: ["00000", "00000", "01111", "10000", "01110", "00001", "11110"],
  n: ["00000", "00000", "11110", "10001", "10001", "10001", "10001"],
};
</script>

<style scoped>
/* Each pixel: wider than tall — the key to the bradeac.dev look */
.pixel {
  display: block;
  width: 8px;
  height: 4px;
}

.pixel-on {
  border: 1px solid #43d9ad;
  background: transparent;
}

/* Invisible placeholder so the grid stays uniform */
.pixel-off {
  border: 1px solid transparent;
}
</style>
