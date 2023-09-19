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
    <router-view v-else></router-view>
  </div>
</template>
