<template>
  <div class="w-full h-screen text-accent-color">
    <Navbar />
    <div id="content" class="overflow-hidden select-none">
      <router-view></router-view>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import Footer from "@/components/Footer.vue";
import Navbar from "@/components/Navbar.vue";
</script>
