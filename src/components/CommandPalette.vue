<template>
  <Transition name="palette">
    <div v-if="paletteOpen" class="palette-backdrop fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]"
      @mousedown.self="close" @wheel="blockPageScroll" @touchmove="blockPageScroll">
      <div class="palette-window w-full max-w-[560px] flex flex-col" role="dialog" aria-modal="true"
        aria-label="Command palette">
        <div class="flex items-center gap-1.5 px-4 py-3 border-b border-border-white shrink-0">
          <span class="w-3 h-3 rounded-full bg-red-500 opacity-80" />
          <span class="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
          <span class="w-3 h-3 rounded-full bg-green-500 opacity-80" />
          <span class="ml-auto text-xs text-gray-gradient-01 select-none">abhiram@portfolio ~ $ palette</span>
        </div>

        <div class="flex items-center gap-2 px-4 py-3 border-b border-border-white">
          <span class="text-accent-variable text-sm select-none">$</span>
          <input ref="inputRef" v-model="query" type="text" autocomplete="off" autocorrect="off" spellcheck="false"
            placeholder="search commands…" role="combobox" aria-expanded="true" aria-controls="palette-list"
            aria-autocomplete="list" :aria-activedescendant="activeItem ? `palette-item-${activeItem.id}` : undefined"
            class="flex-1 bg-transparent outline-none text-white-gradient-01 text-sm caret-accent-variable placeholder:text-gray-gradient-01"
            @keydown="onKeydown" />
        </div>

        <ul id="palette-list" ref="listRef" role="listbox" aria-label="Commands"
          class="max-h-[50vh] overflow-y-auto scrollbar-thin py-2">
          <template v-for="(item, i) in filtered" :key="item.id">
            <li v-if="i === 0 || filtered[i - 1].group !== item.group" role="presentation"
              class="px-4 pt-2 pb-1 text-xs italic text-gray-gradient-01">
              // {{ item.group }}
            </li>
            <li :id="`palette-item-${item.id}`" role="option" :aria-selected="i === activeIndex"
              class="palette-item flex items-center gap-2 px-4 py-1.5 text-sm cursor-pointer"
              :class="{ 'palette-item--active': i === activeIndex }" :data-cursor="item.label"
              @mousemove="activeIndex = i" @click="run(item)">
              <span class="palette-marker text-accent-variable shrink-0">&gt;</span>
              <span class="text-white-gradient-01">{{ item.label }}</span>
              <span v-if="item.detail" class="text-gray-gradient-01 truncate">— {{ item.detail }}</span>
              <span v-if="item.external" class="ml-auto text-gray-gradient-01 text-xs shrink-0" aria-label="opens in a new tab">↗</span>
            </li>
          </template>
          <li v-if="!filtered.length" class="px-4 py-3 text-sm text-red-400" role="presentation">
            command not found: {{ query }}
          </li>
        </ul>

        <div class="flex gap-4 px-4 py-2 border-t border-border-white text-xs text-gray-gradient-01 select-none">
          <span>↑↓ navigate</span>
          <span>enter select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { paletteOpen, pendingGame } from "@/composables/commandPalette.js";
import { scrollToSection } from "@/composables/useNavLinks.js";
import { SOCIALS, EMAIL } from "@/data/socials.js";
import { GAME_REGISTRY } from "@/data/games.js";
import { useTheme } from "@/composables/useTheme.js";
import { unlock } from "@/composables/achievements.js";

const route = useRoute();
const router = useRouter();
const { theme, toggleTheme } = useTheme();

const query = ref("");
const activeIndex = ref(0);
const inputRef = ref(null);
const listRef = ref(null);
let returnFocusTo = null;

const items = computed(() => [
  {
    id: "projects",
    group: "navigate",
    label: "Jump to projects",
    keywords: "work portfolio section",
    run: () => goToSection("projects"),
  },
  ...SOCIALS.map((s) => ({
    id: `social-${s.id}`,
    group: "socials",
    label: s.id === "email" ? "Send an email" : `Open ${s.label}`,
    detail: s.id === "email" ? EMAIL : null,
    keywords: "social contact link",
    external: s.id !== "email",
    run: () => openLink(s.url),
  })),
  ...GAME_REGISTRY.filter((g) => !g.comingSoon).map((g) => ({
    id: `game-${g.id}`,
    group: "games",
    label: `Play ${g.id}`,
    detail: g.description,
    keywords: "game play fun",
    run: () => playGame(g.id),
  })),
  {
    id: "theme",
    group: "theme",
    label: theme.value === "dark" ? "Switch to light theme" : "Switch to dark theme",
    keywords: "toggle theme dark light mode",
    run: toggleTheme,
  },
]);

const filtered = computed(() => {
  const terms = query.value.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return items.value;
  return items.value.filter((item) => {
    const haystack = `${item.label} ${item.detail ?? ""} ${item.group} ${item.keywords ?? ""}`.toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
});

const activeItem = computed(() => filtered.value[activeIndex.value] ?? null);

watch(query, () => { activeIndex.value = 0; });

async function ensureOnLanding() {
  if (route.path !== "/") {
    await router.push("/");
    await nextTick();
  }
}

async function goToSection(id) {
  await ensureOnLanding();
  scrollToSection(id);
}

function openLink(url) {
  if (url.startsWith("mailto:")) window.location.href = url;
  else window.open(url, "_blank", "noopener,noreferrer");
}

async function playGame(id) {
  await ensureOnLanding();
  pendingGame.value = id;
}

function run(item) {
  if (!item) return;
  close();
  item.run();
}

function open() {
  returnFocusTo = document.activeElement;
  query.value = "";
  activeIndex.value = 0;
  paletteOpen.value = true;
  unlock("power-user");
}

function close() {
  paletteOpen.value = false;
}

watch(paletteOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => inputRef.value?.focus());
  } else if (returnFocusTo instanceof HTMLElement && document.contains(returnFocusTo)) {
    returnFocusTo.focus({ preventScroll: true });
  }
});

function scrollActiveIntoView() {
  nextTick(() => {
    const el = activeItem.value && document.getElementById(`palette-item-${activeItem.value.id}`);
    el?.scrollIntoView({ block: "nearest" });
  });
}

function onKeydown(event) {
  const count = filtered.value.length;
  if (event.key === "ArrowDown" && count) {
    event.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % count;
    scrollActiveIntoView();
  } else if (event.key === "ArrowUp" && count) {
    event.preventDefault();
    activeIndex.value = (activeIndex.value - 1 + count) % count;
    scrollActiveIntoView();
  } else if (event.key === "Enter") {
    event.preventDefault();
    run(activeItem.value);
  } else if (event.key === "Escape") {
    event.preventDefault();
    close();
  } else if (event.key === "Tab") {
    event.preventDefault();
  }
}

function onGlobalKeydown(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (paletteOpen.value) close();
    else open();
  }
}

function blockPageScroll(event) {
  if (!listRef.value?.contains(event.target)) event.preventDefault();
}

onMounted(() => window.addEventListener("keydown", onGlobalKeydown));
onUnmounted(() => window.removeEventListener("keydown", onGlobalKeydown));
</script>

<style scoped>
.palette-backdrop {
  background-color: rgba(1, 10, 20, 0.55);
  backdrop-filter: blur(4px);
}

:root[data-theme="light"] .palette-backdrop {
  background-color: rgba(11, 32, 54, 0.25);
}

.palette-window {
  background: linear-gradient(150deg,
      rgba(1, 22, 39, 0.97) 0%,
      rgba(1, 18, 33, 0.99) 100%);
  border: 1px solid var(--color-border-white);
  border-radius: 8px;
  box-shadow: 0px 24px 48px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

:root[data-theme="light"] .palette-window {
  background: linear-gradient(150deg,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(239, 244, 248, 0.99) 100%);
  box-shadow: 0px 16px 40px rgba(11, 32, 54, 0.18);
}

.palette-marker {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.palette-item--active {
  background-color: var(--color-border-white);
}

.palette-item--active .palette-marker {
  opacity: 1;
}

.palette-enter-active,
.palette-leave-active {
  transition: opacity 0.15s ease;
}

.palette-enter-active .palette-window,
.palette-leave-active .palette-window {
  transition: transform 0.15s ease;
}

.palette-enter-from,
.palette-leave-to {
  opacity: 0;
}

.palette-enter-from .palette-window,
.palette-leave-to .palette-window {
  transform: translateY(-8px) scale(0.98);
}
</style>
