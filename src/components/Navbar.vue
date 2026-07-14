<template>
  <div class="fixed left-6 top-1/2 -translate-y-1/2 z-30">
    <nav class="nav-pill flex flex-col items-center gap-1 py-4 px-2">
      <RouterLink
        v-for="link in visibleLinks"
        :key="link.id"
        :to="link.to"
        v-slot="{ isActive }"
        class="relative flex w-full justify-center"
      >
        <span v-if="isActive" class="active-bar"></span>
        <span
          class="nav-item"
          :class="isActive ? 'nav-item-active' : 'text-gray-gradient-01'"
          :title="link.name"
        >
          <svg v-if="link.to === '/'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 11.5 12 4l8 7.5" />
            <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
          </svg>

          <svg v-else-if="link.to === '/blogs'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M9 8h6M9 12h6M9 16h4" />
          </svg>

          <svg v-else-if="link.to === '/projects'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 7a1 1 0 0 1 1-1h4l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
          </svg>

          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        </span>
      </RouterLink>
    </nav>
  </div>
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
.nav-pill {
  border-radius: 40px;
  border: 1px solid #0c1616;
  background: linear-gradient(150deg,
      rgba(23, 85, 83, 0.7) 1.7%,
      rgba(67, 217, 173, 0.09) 81.82%);
  box-shadow:
    0px 2px 0px 0px rgba(255, 255, 255, 0.3) inset,
    0px 20px 40px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(32px);
}

.nav-item {
  width: 2.75rem;
  height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  transition: background-color 0.2s, color 0.2s;
}

.nav-item svg {
  width: 1.25rem;
  height: 1.25rem;
}

.nav-item:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.06);
}

.nav-item-active {
  color: #43d9ad;
  background-color: rgba(67, 217, 173, 0.14);
}

.active-bar {
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  border-radius: 2px;
  background-color: #43d9ad;
}
</style>
