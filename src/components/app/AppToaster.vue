<template>
  <Toaster class="app-toaster" :position="isMobile ? 'top-center' : 'bottom-right'" :theme="theme"
    :duration="DURATION_MS" :visible-toasts="3" :gap="10" :offset="{ bottom: '24px', right: '24px' }"
    :mobile-offset="{ top: '16px', left: '16px', right: '16px' }" container-aria-label="Notifications" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { Toaster } from "vue-sonner";
import "vue-sonner/style.css";
import { useTheme } from "@/composables/useTheme.js";

const DURATION_MS = 3500;
const MOBILE_QUERY = "(max-width: 639px)";

const { theme } = useTheme();
const isMobile = ref(false);
let mql = null;

const syncMobile = () => { isMobile.value = mql.matches; };

onMounted(() => {
  mql = window.matchMedia(MOBILE_QUERY);
  syncMobile();
  mql.addEventListener("change", syncMobile);
});

onUnmounted(() => mql?.removeEventListener("change", syncMobile));
</script>

<style>
.app-toaster[data-sonner-toaster] {
  --normal-bg: var(--color-theme-main);
  --normal-border: var(--color-border-white);
  --normal-text: var(--color-white-gradient-01);
  --error-bg: var(--color-theme-main);
  --error-border: var(--color-border-white);
  --error-text: var(--color-accent-url);
  --border-radius: 8px;
  --width: 320px;
  font-family: "Fira Code", monospace;
}

.app-toaster [data-sonner-toast][data-styled="true"] {
  padding: 12px 16px;
  box-shadow: 0px 16px 32px rgba(0, 0, 0, 0.35);
}

:root[data-theme="light"] .app-toaster [data-sonner-toast][data-styled="true"] {
  box-shadow: 0px 12px 28px rgba(11, 32, 54, 0.16);
}

.app-toaster [data-sonner-toast] [data-title] {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--color-accent-variable);
}

.app-toaster [data-sonner-toast][data-type="error"] [data-title] {
  color: var(--color-accent-url);
}

.app-toaster [data-sonner-toast] [data-description] {
  font-size: 0.875rem;
  color: var(--color-white-gradient-01);
}
</style>
