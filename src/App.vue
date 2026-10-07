<template>
  <div class="w-full min-h-screen h-full text-accent-color flex items-center justify-center">
    <PageLoader />
    <CustomCursor />
    <Navbar />
    <CommandPalette />
    <AppToaster />
    <ChaosMode />
    <div id="content" class="w-full h-full select-none">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import Navbar from "@/components/app/Navbar.vue";
import PageLoader from "@/components/app/PageLoader.vue";
import CustomCursor from "@/components/app/CustomCursor.vue";
import CommandPalette from "@/components/app/CommandPalette.vue";
import AppToaster from "@/components/app/AppToaster.vue";
import ChaosMode from "@/components/app/ChaosMode.vue";
</script>
