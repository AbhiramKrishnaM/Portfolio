<template>
  <div
    class="fixed bottom-0 left-0 w-full border-t border-border-white px-6 selection-none"
  >
    <div class="flex items-center justify-between">
      <div id="redirects" class="flex items-center justify-center">
        <span class="py-3.5 pr-3.5 border-r border-border-white">
          find me in:
        </span>

        <a
          href="https://www.linkedin.com/in/abhiram-krishna/"
          target="_blank"
          class="p-3.5 border-r border-border-white"
        >
          <img :src="Linkedin" alt="Linkedin icon" />
        </a>
        <!-- will add this later -->
        <!-- <a href="#" class="p-3.5 border-r border-border-white">
          <img :src="Spotify" alt="Spotify icon" />
        </a> -->
      </div>

      <div
        id="github"
        class="flex items-center justify-center gap-2 p-3.5 border-l border-border-white"
      >
        <a href="https://github.com/AbhiramKrishnaM" target="_blank">
          @AbhiramKrishnaM
        </a>
        <a href="https://github.com/AbhiramKrishnaM" target="_blank">
          <img :src="Github" alt="Github icon" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
// assets/icons
import Linkedin from "~/icons/linkedin.svg";
import Spotify from "~/icons/spotify.svg";
import Github from "~/icons/github.svg";
</script>
