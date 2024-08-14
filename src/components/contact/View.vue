<template>
  <div>View section</div>
</template>

<script setup>
import { defineProps } from "vue";
/**
 * Instead of adding validations on the form we will add validation here
 * This should closely watch what is happening on the form component
 * Format date here
 */

defineProps({ formObject: { type: Object, required: true } });
</script>

<style scoped></style>
