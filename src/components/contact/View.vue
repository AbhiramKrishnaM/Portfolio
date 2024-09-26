<template>
  <div>
    <div class="flex">
      <span class="mr-10">1</span>
      <span class="text-code-rest">
        <p class="inline text-code-keyword">const</p>
        button
        <p class="inline">=</p>
        document.querySelector
      </span>
      <span class="inline text-gray-gradient-01">(</span>
      <span class="text-code-id">'#sendBtn'</span>
      <span class="inline text-gray-gradient-01">);</span>
    </div>

    <div class="flex">
      <span class="mr-10">2</span>
    </div>

    <div class="flex">
      <span class="mr-10">3</span>

      <span class="text-code-rest">
        <p class="inline text-code-keyword">const</p>
        message
        <p class="inline">=</p>
      </span>
      <span class="inline text-gray-gradient-01 ml-2">{</span>
    </div>

    <div class="flex">
      <span class="mr-10">4</span>

      <span class="text-code-rest ml-4"> name </span>
      <span class="inline text-gray-gradient-01">:</span>
      <span class="text-code-id ml-2">{{ `"${formObject.name}"` }}</span>
      <span class="inline text-gray-gradient-01">,</span>
    </div>

    <div class="flex">
      <span class="mr-10">5</span>

      <span class="text-code-rest ml-4"> email </span>
      <span class="inline text-gray-gradient-01">:</span>
      <span class="text-code-id ml-2">{{ `"${formObject.email}"` }}</span>
      <span class="inline text-gray-gradient-01">,</span>
    </div>

    <div class="flex">
      <span class="mr-10">6</span>

      <span class="text-code-rest ml-4"> message </span>
      <span class="inline text-gray-gradient-01">:</span>
      <span class="text-code-id ml-2">{{ `"${formObject.message}"` }}</span>
      <span class="inline text-gray-gradient-01">,</span>
    </div>

    <div class="flex">
      <span class="mr-10">7</span>

      <span class="text-code-rest ml-4"> date </span>
      <span class="inline text-gray-gradient-01">:</span>
      <span class="text-code-id ml-2">{{ `"${formObject.date}"` }}</span>
    </div>

    <div class="flex">
      <span class="mr-10">8</span>
      <span class="inline text-gray-gradient-01">};</span>
    </div>

    <div class="flex">
      <span class="mr-10">9</span>
    </div>

    <div class="flex">
      <span class="mr-10">10</span>

      <span class="text-code-rest"> button.addEventListener </span>
      <span class="inline text-gray-gradient-01">(</span>
      <span class="text-code-id">'click'</span>
      <span class="inline text-gray-gradient-01">,</span>
      <span class="inline text-gray-gradient-01 ml-2">()</span>
      <span class="text-code-id ml-2">=></span>
      <span class="inline text-gray-gradient-01 ml-2">{</span>
    </div>

    <div class="flex">
      <span class="mr-10">11</span>

      <span class="text-code-rest ml-4"> form.send </span>
      <span class="inline text-gray-gradient-01">(</span>
      <span class="text-code-rest"> message </span>
      <span class="inline text-gray-gradient-01">);</span>
    </div>

    <div class="flex">
      <span class="mr-10">12</span>
      <span class="inline text-gray-gradient-01">});</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
/**
 * Instead of adding validations on the form we will add validation here
 * This should closely watch what is happening on the form component
 * Format date here
 */

defineProps({ formObject: { type: Object, required: true } });
</script>

<style scoped></style>
