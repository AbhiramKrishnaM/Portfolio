<template>
  <ul class="grid grid-cols-3 gap-4 w-fit" aria-label="Tech stack">
    <li v-for="item in STACK" :key="item.id">
      <StackTile :item="item" />
    </li>
  </ul>
</template>

<script setup>
import StackTile from "@/components/stack/StackTile.vue";
import { STACK } from "@/data/stack.js";
</script>
