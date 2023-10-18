<template>
  <div class="min-w-full min-h-screen flex items-center justify-center">
    <Loading
      v-if="showLoading"
      @animation-complete="() => (showLoading = false)"
    />
    <div v-else class="flex flex-col w-full h-screen text-accent-color">
      <Navbar />
      <div class="px-6 h-full overflow-y-auto">
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
import Navbar from "@/components/Navbar.vue";

const showLoading = ref(true);
</script>
