<template>
  <form class="flex flex-col gap-6 items-start" @submit.prevent="submit">
    <div class="w-80">
      <label
        for="first_name"
        class="block mb-3 text-sm font-medium text-gray-gradient-01"
      >
        _name:
      </label>
      <input
        type="text"
        id="first_name"
        v-model="contactData.name"
        class="block p-2.5 w-full border text-gray-400 text-sm rounded-lg bg-bg-field-default border-border-white placeholder-gray-400 focus:ring-2 focus:ring-gray-gradient-01 focus:outline-none"
        required
      />
    </div>

    <div class="w-80">
      <label
        for="first_name"
        class="block mb-3 text-sm font-medium text-gray-gradient-01"
      >
        _email:
      </label>
      <input
        type="text"
        id="email"
        v-model="contactData.email"
        class="block p-2.5 w-full border text-gray-400 text-sm rounded-lg bg-bg-field-default border-border-white placeholder-gray-400 focus:ring-2 focus:ring-gray-gradient-01 focus:outline-none"
        required
      />
    </div>

    <div class="w-80">
      <label
        for="message"
        class="block mb-3 text-sm font-medium text-gray-gradient-01"
      >
        _message:
      </label>
      <textarea
        id="message"
        rows="4"
        v-model="contactData.message"
        class="block p-2.5 w-full text-sm text-gray-400 rounded-lg border bg-bg-field-default border-border-white placeholder-gray-400 focus:ring-2 focus:ring-gray-gradient-01 focus:outline-none"
      ></textarea>
    </div>

    <button
      id="sendBtn"
      type="submit"
      class="px-5 py-2.5 text-white bg-bg-button-default focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm"
    >
      submit-message
    </button>
  </form>
</template>

<script setup>
import { ref, watch } from "vue";
import { getFormattedDate } from "../../utils/dateHelper";

// intialize
const emits = defineEmits(["submit-form"]);

// state
const contactData = ref({
  name: "",
  email: "",
  message: "",
  date: "",
  preview: true,
});

// actions
function submit() {
  contactData.value.preview = false;

  emits("submit-form", contactData.value);
}

// hook
watch(
  () => contactData.value,
  () => {
    if (contactData.value.preview) {
      // set current date
      contactData.value.date = getFormattedDate();

      emits("submit-form", contactData.value);
    }
  },
  { deep: true }
);
</script>

<style scoped></style>
