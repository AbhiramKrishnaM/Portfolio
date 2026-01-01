<template>
  <div
    id="success-message"
    class="w-96 text-center flex flex-col items-center justify-center"
  >
    <h1 class="text-white text-2xl mb-2">Thank You! 🤘</h1>
    <span>
      Your message has been accepted. You will recieve answer really soon!
    </span>

    <button
      type="button"
      class="px-5 py-2.5 text-white bg-bg-button-default focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm mt-9"
      @click="submitNew"
    >
      send-new-message
    </button>
  </div>
</template>

<script setup>

const emits = defineEmits(["send-new"]);
// actions

function submitNew() {
  emits("send-new");
}
</script>
