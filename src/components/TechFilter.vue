<template>
  <div class="w-64 bg-theme-main border-r border-r-border-white h-screen overflow-y-auto scrollbar-custom">
    <div>
      <div
        class="pl-4 flex items-center gap-2 h-12 mb-0 border-b border-border-white cursor-pointer"
        @click="toggleDropdown"
      >
        <span class="dropdown-arrow text-accent-color transition-transform duration-200" :class="{ 'rotate-180': isDropdownOpen }">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="text-sm font-mono font-medium text-accent-color">projects</span>
      </div>

      <div
        class="pl-2 py-4 overflow-y-auto scrollbar-custom"
        :style="{ maxHeight: `${availableHeight}px` }"
        v-show="isDropdownOpen"
      >
        <div
          v-for="tech in availableTechs"
          :key="tech.id"
          class="flex items-center gap-3 cursor-pointer py-3 px-2 rounded transition-colors duration-200 hover:bg-border-white"
          @click="toggleTech(tech.id)"
        >
          <div class="relative w-4 h-4">
            <input
              type="checkbox"
              :id="`tech-${tech.id}`"
              :checked="selectedTechs.includes(tech.id)"
              class="absolute opacity-0 cursor-pointer w-4 h-4"
              @change="toggleTech(tech.id)"
            />
            <label :for="`tech-${tech.id}`" class="absolute inset-0 cursor-pointer bg-transparent border border-accent-color rounded-sm transition-all duration-200" :class="{ 'bg-accent-color border-accent-color': selectedTechs.includes(tech.id) }"></label>
          </div>
          <img
            v-if="tech.icon"
            :src="tech.icon"
            :alt="`${tech.name} icon`"
            class="w-5 h-5 flex-shrink-0"
          />
          <span v-else class="w-5 h-5 flex-shrink-0 rounded-sm border border-border-white/40"></span>
          <span
            class="text-sm font-mono text-accent-color flex-1"
            :class="{ 'text-white': selectedTechs.includes(tech.id) }"
          >
            {{ tech.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useDynamicHeight } from "../composables/useDynamicHeight.js";

const props = defineProps({
  selectedTechs: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:selectedTechs"]);

const isDropdownOpen = ref(true);

// Use dynamic height composable
const { availableHeight } = useDynamicHeight();

const availableTechs = ref([
  { id: "react", name: "React", icon: "/icons/reactjs.svg" },
  { id: "nextjs", name: "Next.js", icon: "/icons/nextjs.svg" },
  { id: "vuejs", name: "Vue.js", icon: "/icons/vuejs.svg" },
  { id: "nuxtjs", name: "Nuxt.js", icon: "/icons/nuxtjs.svg" },
  { id: "nodejs", name: "Node.js", icon: "/icons/nodejs-icon.svg" },
  { id: "express", name: "Express.js", icon: "/icons/express-icon.svg" },
  { id: "typescript", name: "TypeScript", icon: "/icons/typescript.svg" },
  { id: "javascript", name: "JavaScript", icon: "/icons/javascript-icon.svg" },
  { id: "go", name: "Go", icon: "/icons/go.svg" },
  { id: "django", name: "Django", icon: "/icons/django-icon.svg" },
  { id: "python", name: "Python", icon: "/icons/python-icon.svg" },
  { id: "fastapi", name: "FastAPI", icon: "/icons/fastapi.svg" },
  { id: "vercel", name: "Vercel", icon: "/icons/vercel.svg" },
  { id: "reactnative", name: "React Native", icon: "/icons/react-native.svg" },
  { id: "threejs", name: "Three.js", icon: "/icons/threejs-icon.svg" },
  { id: "tailwind", name: "Tailwind CSS", icon: "/icons/tailwind-icon.svg" },
]);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const toggleTech = (techId) => {
  const currentSelected = [...props.selectedTechs];
  const index = currentSelected.indexOf(techId);

  if (index > -1) {
    currentSelected.splice(index, 1);
  } else {
    currentSelected.push(techId);
  }

  emit("update:selectedTechs", currentSelected);
};

// no-op: selectedTechNames removed as not used in UI
</script>

