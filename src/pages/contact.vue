<template>
  <div class="flex items-center h-full">
    <div
      class="h-full w-1/2 flex justify-center items-center border-r border-border-white"
    >
      <Form />
    </div>

    <div class="h-full w-1/2 flex justify-center items-center">
      <ViewForm />
    </div>
  </div>
</template>

<script setup>
import Form from "../components/contact/Form.vue";
import ViewForm from "../components/contact/View.vue";
</script>
