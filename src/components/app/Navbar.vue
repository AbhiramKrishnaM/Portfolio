<template>
  <div
    class="fixed z-30 bottom-6 left-1/2 -translate-x-1/2 sm:left-6 sm:top-1/2 sm:bottom-auto sm:translate-x-0 sm:-translate-y-1/2"
  >
    <nav class="nav-pill flex flex-row sm:flex-col items-center gap-1 px-4 py-2 sm:px-2 sm:py-4">
      <span
        v-if="indicatorReady"
        class="active-bar"
        :class="isMobile ? 'active-bar--horizontal' : 'active-bar--vertical'"
        :style="indicatorStyle"
      ></span>

      <div
        v-for="(link, index) in visibleLinks"
        :key="link.id"
        class="relative items-center justify-center sm:w-full"
        :class="link.section ? 'hidden lg:flex' : 'flex'"
        :ref="(el) => setItemRef(el, index)"
      >
        <RouterLink :to="link.to" custom v-slot="{ href, navigate }">
          <a
            :href="link.section ? `${href}#${link.section}` : href"
            :aria-label="link.name"
            :aria-current="index === activeIndex ? 'page' : undefined"
            @click="onNavClick($event, link, navigate)"
          >
            <span
              class="nav-item"
              :class="index === activeIndex ? 'nav-item-active' : 'text-gray-gradient-01'"
              :data-cursor="link.name"
            >
              <svg v-if="link.id === 'home'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 11.5 12 4l8 7.5" />
                <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
              </svg>

              <svg v-else-if="link.id === 'projects'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <path d="m10 11-2 2 2 2" />
                <path d="m14 11 2 2-2 2" />
              </svg>

              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </span>
          </a>
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { useNavLinks, scrollToSection } from "@/composables/useNavLinks.js";
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute } from "vue-router";

const { links, activeSection } = useNavLinks();
const route = useRoute();

const visibleLinks = computed(() => {
  return links.value.filter((link) => !link.hidden);
});

const activeIndex = computed(() => {
  const onPage = (link) => link.to === route.path;
  const sectionIdx = visibleLinks.value.findIndex(
    (link) => link.section && onPage(link) && link.section === activeSection.value
  );
  if (sectionIdx !== -1) return sectionIdx;
  return visibleLinks.value.findIndex((link) => !link.section && onPage(link));
});

function onNavClick(event, link, navigate) {
  if (link.to !== route.path) {
    navigate(event);
    return;
  }
  event.preventDefault();
  if (!(link.section && scrollToSection(link.section))) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

const MOBILE_QUERY = "(max-width: 639px)";

const BAR_LENGTH = 26;
const itemRefs = ref([]);
const indicatorOffset = ref(0);
const indicatorReady = ref(false);
const isMobile = ref(false);

const indicatorStyle = computed(() => ({
  transform: isMobile.value
    ? `translateX(${indicatorOffset.value}px)`
    : `translateY(${indicatorOffset.value}px)`,
}));

function setItemRef(el, index) {
  if (el) itemRefs.value[index] = el;
}

function updateIndicatorPosition() {
  const el = itemRefs.value[activeIndex.value];
  if (!el) return;
  indicatorOffset.value = isMobile.value
    ? el.offsetLeft + (el.offsetWidth - BAR_LENGTH) / 2
    : el.offsetTop + (el.offsetHeight - BAR_LENGTH) / 2;
  indicatorReady.value = true;
}

let mql;
function handleViewportChange() {
  isMobile.value = mql.matches;
  nextTick(updateIndicatorPosition);
}

watch(activeIndex, () => nextTick(updateIndicatorPosition));

onMounted(() => {
  mql = window.matchMedia(MOBILE_QUERY);
  isMobile.value = mql.matches;
  mql.addEventListener("change", handleViewportChange);
  window.addEventListener("resize", handleViewportChange);
  nextTick(updateIndicatorPosition);
});

onUnmounted(() => {
  mql?.removeEventListener("change", handleViewportChange);
  window.removeEventListener("resize", handleViewportChange);
});
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
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

:root[data-theme="light"] .nav-pill {
  border-color: var(--color-border-white);
  background: linear-gradient(150deg,
      rgba(255, 255, 255, 0.9) 1.7%,
      rgba(239, 244, 248, 0.75) 81.82%);
  box-shadow:
    0px 2px 0px 0px rgba(255, 255, 255, 0.6) inset,
    0px 16px 32px rgba(11, 32, 54, 0.14);
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
  color: var(--color-white-gradient-01);
  transform: scale(1.2);
}

.nav-item-active {
  color: var(--color-accent-url);
  transform: scale(1.18);
}

.nav-item-active:hover {
  color: var(--color-accent-url);
  transform: scale(1.32);
}

.active-bar {
  position: absolute;
  border-radius: 2px;
  background-color: var(--color-accent-url);
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease;
}

.active-bar--vertical {
  left: -6px;
  top: 0;
  width: 3px;
  height: 26px;
}

.active-bar--horizontal {
  left: 0;
  bottom: -6px;
  width: 26px;
  height: 3px;
}
</style>
