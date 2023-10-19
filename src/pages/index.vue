<template>
  <div class="flex items-center justify-center h-full gap-92">
    <div>
      <div id="section-1" class="text-white-gradient-01 font-normal">
        <h6 class="text-lg">Hi all, I am</h6>
        <h1 class="text-6xl">Abhiram Krishna M</h1>
        <span class="text-3xl text-accent-sub"> > Full Stack Developer </span>
      </div>

      <div id="section-2" class="mt-82">
        <ul class="text-gray-gradient-01 font-normal">
          <li>// complete the game to continue.</li>
          <li>// you can also see it on my github page.</li>
        </ul>

        <div class="mt-2.5 text-accent-sub flex font-medium">
          const
          <div class="text-accent-variable ml-2">githubLink</div>
          <div class="text-white mx-2">=</div>
          <div class="text-accent-url">"https://github.com/example/url"</div>
        </div>
      </div>
    </div>

    <div id="snake-game" class="relative">
      <img
        :src="Green"
        alt="Background halo"
        class="absolute -left-32 -top-32"
      />

      <img
        :src="Blue"
        alt="Background halo"
        class="absolute -right-36 -bottom-36"
      />
    </div>
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
