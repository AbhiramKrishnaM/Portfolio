<template>
  <aside class="w-52 h-screen sticky top-0 shrink-0 flex flex-col justify-between border-r border-border-white bg-theme-main">
    <RouterLink to="/" class="p-6 block w-fit">
      <img src="/icons/terminal-icon.svg" alt="logo" class="w-9 h-9 rounded-md" />
    </RouterLink>

    <nav class="p-6 pt-10 flex flex-col gap-3">
      <RouterLink
        v-for="link in visibleLinks"
        :key="link.id"
        :to="link.to"
        active-class="active"
        v-slot="{ isActive }"
      >
        <span
          class="nav-link text-sm block"
          :class="isActive ? 'text-white' : 'text-gray-gradient-01'"
        >
          <span v-if="isActive" class="text-accent-variable">/ </span>{{ link.name }}
        </span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { useNavlinks } from "@/composables/navLinks.js";
import { computed } from "vue";

const { links } = useNavlinks();

const visibleLinks = computed(() => {
  return links.value.filter((link) => !link.hidden);
});
</script>

<style scoped>
.nav-link {
  transition: color 0.2s;
}

.nav-link:hover {
  color: white;
}
</style>
