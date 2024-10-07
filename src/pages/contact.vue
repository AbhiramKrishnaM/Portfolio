<template>
  <div class="flex items-center h-full">
    <div
      class="h-full w-1/2 flex justify-center items-center border-r border-border-white"
    >
      <SuccessMessage v-if="showSuccessMessage" @send-new="sendNew" />
      <Form v-else @submit-form="submit" />
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
import SuccessMessage from "../components/contact/Success.vue";

const form = ref({
  name: "",
  email: "",
  message: "",
  date: "",
  preview: true,
});

const showSuccessMessage = ref(false);

// methods
function submit(data) {
  if (data.preview) {
    form.value = data;
  } else {
    showSuccessMessage.value = true;
  }
}

function sendNew() {
  /**
   * Clear the current form
   * set the showSuccessMessage State to false
   */
  form.value = {
    name: "",
    email: "",
    message: "",
    date: "",
    preview: true,
  };

  showSuccessMessage.value = false;
}
</script>
