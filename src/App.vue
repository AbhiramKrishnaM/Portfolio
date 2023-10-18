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

      <div class="fixed bottom-0 left-0">footer section</div>
    </div>
  </div>
</template>
