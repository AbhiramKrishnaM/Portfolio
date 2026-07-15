<template>
  <div class="w-full min-h-screen h-full text-accent-color flex items-center justify-center">
    <CustomCursor />
    <Navbar />
    <div id="content" class="w-full h-full select-none">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
import CustomCursor from "@/components/CustomCursor.vue";
</script>
