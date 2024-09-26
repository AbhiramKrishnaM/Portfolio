<template>
  <form>
    <div>
      <label
        for="first_name"
        class="block mb-2 text-sm font-medium text-gray-gradient-01"
      >
        _name:
      </label>
      <input
        type="text"
        id="first_name"
        class="block p-2.5 w-full border text-gray-900 text-sm rounded-lg bg-bg-field-default border-border-white placeholder-gray-400"
        required
      />
    </div>

    <div>
      <label
        for="first_name"
        class="block mb-2 text-sm font-medium text-gray-gradient-01"
      >
        _email:
      </label>
      <input
        type="text"
        id="first_name"
        class="block p-2.5 w-full border text-gray-900 text-sm rounded-lg bg-bg-field-default border-border-white placeholder-gray-400"
        required
      />
    </div>

    <div>
      <label
        for="message"
        class="block mb-2 text-sm font-medium text-gray-gradient-01"
      >
        _message:
      </label>
      <textarea
        id="message"
        rows="4"
        class="block p-2.5 w-full text-sm text-gray-900 rounded-lg border bg-bg-field-default border-border-white placeholder-gray-400"
      ></textarea>
    </div>
  </form>
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
