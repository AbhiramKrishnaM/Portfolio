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

        <a
          href="https://github.com/AbhiramKrishnaM/snake-game-starter"
          target="_blank"
          class="mt-2.5 text-accent-sub flex font-medium"
        >
          const
          <div class="text-accent-variable ml-2">githubLink</div>
          <div class="text-white mx-2">=</div>
          <div class="text-accent-url">
            "https://github.com/AbhiramKrishnaM/snake-game-starter"
          </div>
        </a>
      </div>
    </div>

    <SnakeGame />
  </div>
</template>
<script setup>
// component
import SnakeGame from "@/components/SnakeGame.vue";
</script>
