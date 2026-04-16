<template>
  <div
    class="flex items-center gap-2 px-4 py-2.5 border-t border-border-white"
    @click="focus"
  >
    <span class="text-accent-variable text-sm select-none">$</span>
    <input
      ref="inputEl"
      v-model="model"
      type="text"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
      class="flex-1 bg-transparent outline-none text-white-gradient-01 text-sm caret-accent-variable placeholder-gray-gradient-01"
      placeholder="type a command..."
      @keydown="$emit('keydown', $event)"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";

const model = defineModel({ required: true });

const inputEl = ref(null);

defineEmits(["keydown"]);

function focus() {
  inputEl.value?.focus();
}

defineExpose({ focus });
</script>
