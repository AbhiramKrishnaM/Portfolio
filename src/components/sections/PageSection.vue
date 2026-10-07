<template>
  <section :id="id" class="page-section relative z-10 px-5 sm:pl-28 sm:pr-10 lg:pl-32 lg:pr-20 xl:pl-36 py-20 lg:py-28">
    <div class="mx-auto max-w-5xl">
      <p class="text-sm text-accent-variable">$ {{ command }}</p>
      <h2 class="text-3xl md:text-4xl text-white-gradient-01 mt-2 mb-10">{{ title }}</h2>
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  id: {
    type: String,
    required: true,
  },
  command: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});
</script>
