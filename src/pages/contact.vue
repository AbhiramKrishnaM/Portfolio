<template>
  <div class="flex items-center h-full">
    <div
      class="h-full w-1/2 flex justify-center items-center border-r border-border-white"
    >
      <Form @send-form="(data) => (form = data)" />
    </div>

    <div class="h-full w-1/2 flex justify-center items-center">
      <ViewForm :form-object="form" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
// component
import Form from "../components/contact/Form.vue";
import ViewForm from "../components/contact/View.vue";

const form = ref({
  name: "",
  email: "",
  message: "",
  date: "",
});
</script>
