<template>
  <div class="w-full h-screen text-accent-color">
    <Loading
      v-if="showLoading"
      @animation-complete="() => (showLoading = false)"
    />

    <div v-else>
      <Navbar />
      <div id="content" class="px-6 overflow-hidden select-none">
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
