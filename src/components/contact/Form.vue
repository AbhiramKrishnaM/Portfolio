<template>
  <div>Contact form</div>
</template>

<script setup>
import { ref } from "vue";

// state
const contactData = ref({
  name: "",
  email: "",
  message: "",
  date: "", // Date in ISO format
});
</script>

<style scoped></style>
