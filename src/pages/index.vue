<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref } from "vue";
import Loading from "../components/loading.vue";

const showLoading = ref(true);
</script>
<template>
  <Loading
    v-if="showLoading"
    @animation-complete="() => (showLoading = false)"
  />
</template>
