<script setup>
import { ref } from "vue";
import Loading from "./components/loading.vue";

const showLoading = ref(true);
</script>

<template>
  <div
    class="min-w-full min-h-screen bg-theme-main text-accent-color flex items-center justify-center"
  >
    <Loading
      v-if="showLoading"
      @animation-complete="() => (showLoading = false)"
    />
    <div v-else class="d-flex flex-col w-full h-screen">
      <router-view></router-view>

      <div class="fixed bottom-0 left-0">
        <div>
          <div id="redirects">
            <span>Find me in:</span>
            <a href="#"><img src="" alt="Twitter icon" /></a>
            <a href="#"><img src="" alt="Linkedin icon" /></a>
          </div>

          <div id="github">
            <span>@username</span>
            <a href="#"><img src="" alt="Github icon" /></a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
