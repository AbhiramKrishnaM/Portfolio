<script setup>
import { ref } from "vue";
import Loading from "./components/loading.vue";

// assets/icons
import Twitter from "~/icons/twitter.svg";
import Facebook from "~/icons/facebook.svg";
import Github from "~/icons/github.svg";

const showLoading = ref(true);
</script>

<template>
  <div
    class="min-w-full min-h-screen bg-theme-main text-accent-color flex items-center justify-center border border-border-white"
  >
    <Loading
      v-if="showLoading"
      @animation-complete="() => (showLoading = false)"
    />
    <div v-else class="flex flex-col w-full h-screen">
      <router-view></router-view>

      <div class="fixed bottom-0 left-0 w-full border border-border-white px-6">
        <div class="flex items-center justify-between">
          <div id="redirects" class="flex items-center justify-center">
            <span class="py-3.5 pr-3.5 border-r border-border-white"
              >find me in:</span
            >

            <a href="#" class="p-3.5 border-r border-border-white">
              <img :src="Twitter" alt="Twitter icon" />
            </a>
            <a href="#" class="p-3.5 border-r border-border-white">
              <img :src="Facebook" alt="Facebook icon" />
            </a>
          </div>

          <div
            id="github"
            class="flex items-center justify-center gap-2 p-3.5 border-l border-border-white"
          >
            <a href="#">@AbhiramKrishnaM</a>
            <a href="#"><img :src="Github" alt="Github icon" /></a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
