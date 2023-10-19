<template>
  <div id="snake-game" class="relative">
    <img :src="Green" alt="Background halo" class="absolute -left-32 -top-32" />

    <img
      :src="Blue"
      alt="Background halo"
      class="absolute -right-36 -bottom-36"
    />
  </div>
</template>

<script setup>
// assets
import Green from "~/vectors/Green.svg";
import Blue from "~/vectors/Blue.svg";
</script>

<style scoped>
#snake-game {
  width: 510px;
  height: 475px;
  border: 1px solid;

  border-radius: 8px;
  border: 1px solid #0c1616;
  background: linear-gradient(
    150deg,
    rgba(23, 85, 83, 0.7) 1.7%,
    rgba(67, 217, 173, 0.09) 81.82%
  );
  box-shadow: 0px 2px 0px 0px rgba(255, 255, 255, 0.3) inset;
  backdrop-filter: blur(32px);
}
</style>
