<template>
  <div class="w-full min-h-screen h-full text-accent-color flex">
    <Navbar />
    <div id="content" class="flex-1 min-w-0 h-full select-none flex items-center justify-center">
      <router-view></router-view>
    </div>
    <!-- <Footer /> -->
  </div>
</template>

<script setup>
// import Footer from "@/components/Footer.vue";
import Navbar from "@/components/Navbar.vue";
</script>
