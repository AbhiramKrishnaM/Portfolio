<template>
  <div
    class="min-w-full min-h-screen bg-theme-main text-accent-color flex items-center justify-center border border-border-white"
  >
    <Loading
      v-if="showLoading"
      @animation-complete="() => (showLoading = false)"
    />
    <div v-else class="flex flex-col w-full h-screen">
      <div class="px-6">
        <router-view></router-view>
      </div>
      <Footer />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
// components
import Loading from "./components/loading.vue";
import Footer from "@/components/Footer.vue";

const showLoading = ref(true);
</script>
