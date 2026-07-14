<template>
  <div class="fixed left-6 top-1/2 -translate-y-1/2 z-30">
    <nav class="nav-pill flex flex-col items-center gap-1 py-4 px-2">
      <span
        v-if="indicatorReady"
        class="active-bar"
        :style="{ transform: `translateY(${indicatorTop}px)` }"
      ></span>

      <div
        v-for="(link, index) in visibleLinks"
        :key="link.id"
        class="relative flex w-full justify-center"
        :ref="(el) => setItemRef(el, index)"
      >
        <RouterLink :to="link.to" v-slot="{ isActive }">
          <span
            class="nav-item"
            :class="isActive ? 'nav-item-active' : 'text-gray-gradient-01'"
            :data-cursor="link.name"
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
      </div>
    </nav>
  </div>
</template>

<script setup>
import { useNavlinks } from "@/composables/navLinks.js";
import { computed, ref, watch, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";

const { links } = useNavlinks();
const route = useRoute();

const visibleLinks = computed(() => {
  return links.value.filter((link) => !link.hidden);
});

const activeIndex = computed(() =>
  visibleLinks.value.findIndex((link) => link.to === route.path)
);

// Drives the sliding indicator — measured from the DOM so it stays correct
// regardless of item sizing, rather than assuming a fixed row pitch.
const BAR_HEIGHT = 26;
const itemRefs = ref([]);
const indicatorTop = ref(0);
const indicatorReady = ref(false);

function setItemRef(el, index) {
  if (el) itemRefs.value[index] = el;
}

function updateIndicatorPosition() {
  const el = itemRefs.value[activeIndex.value];
  if (!el) return;
  indicatorTop.value = el.offsetTop + (el.offsetHeight - BAR_HEIGHT) / 2;
  indicatorReady.value = true;
}

watch(activeIndex, () => nextTick(updateIndicatorPosition));
onMounted(() => nextTick(updateIndicatorPosition));
</script>

<style scoped>
.nav-pill {
  position: relative;
  border-radius: 40px;
  border: 1px solid #0c1616;
  background: linear-gradient(150deg,
      rgba(90, 48, 43, 0.7) 1.7%,
      rgba(233, 146, 135, 0.09) 81.82%);
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
  transition:
    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
    color 0.25s ease;
}

.nav-item svg {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.nav-item:hover {
  color: white;
  transform: scale(1.2);
}

.nav-item-active {
  color: #e99287;
  transform: scale(1.18);
}

.nav-item-active:hover {
  color: #e99287;
  transform: scale(1.32);
}

.active-bar {
  position: absolute;
  left: -6px;
  top: 0;
  width: 3px;
  height: 26px;
  border-radius: 2px;
  background-color: #e99287;
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
