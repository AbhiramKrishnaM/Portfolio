<template>
  <div class="flex items-center h-full">
    <div
      class="h-full w-1/2 flex justify-end items-center border-r border-border-white pr-32"
    >
      <Form />
    </div>

    <div class="h-full w-1/2 flex justify-start items-center pl-32">
      <ViewForm />
    </div>
  </div>
</template>

<script setup>
import Form from "../components/contact/Form.vue";
import ViewForm from "../components/contact/View.vue";
</script>
