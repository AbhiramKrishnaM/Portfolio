<template>
  <ul class="border-b border-border-white flex justify-between p-0 m-0">
    <div class="flex">
      <RouterLink
        v-for="link in links"
        :key="link.id"
        :to="link.to"
        class="nav-link"
        active-class="active"
        v-slot="{ isActive }"
      >
        <li
          class="pl-6 py-3.5 pr-3.5 border-r border-border-white"
          :class="{ 'text-white': isActive }"
        >
          {{ link.name }}
        </li>
      </RouterLink>
    </div>

    <RouterLink
      to="/contact"
      class="nav-link"
      active-class="active"
      v-slot="{ isActive }"
    >
      <li
        class="py-3.5 pl-3.5 pr-6 border-l border-border-white"
        :class="{ 'text-white': isActive }"
      >
        _contact-me
      </li>
    </RouterLink>
  </ul>
</template>

<script setup>
import { useNavlinks } from "@/composables/navLinks.js";

const { links } = useNavlinks();
</script>

<style scoped>
/* General link styling */
.nav-link {
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

/* Underline styling */
.nav-link::before {
  content: "";
  position: absolute;
  left: 0px;
  bottom: 0px; /* Position underline at the bottom */
  width: 0; /* Initially no width */
  height: 2px; /* Thickness of underline */
  background-color: #fea55f; /* Color of underline */
  transition: width 0.3s; /* Animation transition */
}

/* Active state, full underline */
.nav-link.active::before {
  width: 100%;
}
</style>
