<template>
  <div
    class="min-w-full min-h-screen bg-theme-main text-accent-color flex items-center justify-center border border-border-white"
  >
    <Loading
      v-if="showLoading"
      @animation-complete="() => (showLoading = false)"
    />
    <div v-else class="flex flex-col w-full h-screen">
      <div
        class="px-6 border-b border-border-white flex items-center justify-between"
      >
        <div class="flex items-center">
          <span class="py-3.5 pr-3.5 border-r border-border-white">
            abhiram-krishna
          </span>
          <ul class="flex items-center">
            <li class="p-3.5 border-r border-border-white">_hello</li>
            <li class="p-3.5 border-r border-border-white">_about-me</li>
            <li class="p-3.5 border-r border-border-white">_projects</li>
          </ul>
        </div>

        <div class="flex w-[186px]">
          <a href="#" class="p-3.5 border-l border-border-white">_contact-me</a>
        </div>
      </div>

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
