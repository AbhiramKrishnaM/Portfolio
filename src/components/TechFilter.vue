<template>
  <div class="tech-filter">
    <div>
      <div
        class="pl-4 flex items-center gap-2 h-12 mb-0 border-b border-border-white cursor-pointer"
        @click="toggleDropdown"
      >
        <span class="dropdown-arrow" :class="{ rotated: isDropdownOpen }">
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
        <span class="filter-title">projects</span>
      </div>

      <div
        class="pl-2 py-4 overflow-y-auto scrollbar-custom"
        :style="{ maxHeight: `${availableHeight}px` }"
        v-show="isDropdownOpen"
      >
        <div
          v-for="tech in availableTechs"
          :key="tech.id"
          class="filter-option"
          @click="toggleTech(tech.id)"
        >
          <div class="checkbox-container">
            <input
              type="checkbox"
              :id="`tech-${tech.id}`"
              :checked="selectedTechs.includes(tech.id)"
              class="tech-checkbox"
              @change="toggleTech(tech.id)"
            />
            <label :for="`tech-${tech.id}`" class="checkbox-label"></label>
          </div>
          <img
            v-if="tech.icon"
            :src="tech.icon"
            :alt="`${tech.name} icon`"
            class="tech-icon"
          />
          <span v-else class="tech-icon-placeholder"></span>
          <span
            class="tech-name"
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

<style scoped>
.tech-filter {
  width: 16rem;
  background-color: #011627;
  border-right: 1px solid #1E2D3D;
  height: 100vh;
  overflow-y: auto;
}

/* Custom scrollbar for the main container */
.tech-filter::-webkit-scrollbar {
  width: 8px;
}

.tech-filter::-webkit-scrollbar-track {
  background: #011627;
  border-radius: 4px;
}

.tech-filter::-webkit-scrollbar-thumb {
  background: #607B96;
  border-radius: 4px;
  border: 1px solid #011627;
}

/* Custom scrollbar for dropdown content */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #011627;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #607B96;
  border-radius: 4px;
  border: 1px solid #011627;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #4D5BCE;
}

.filter-title {
  font-size: 0.875rem;
  font-family: Fira Code, monospace;
  font-weight: 500;
  color: #607B96;
}

.dropdown-arrow {
  transition: transform 0.2s;
  color: #607B96;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.filter-option:hover {
  background-color: #1E2D3D;
}

.checkbox-container {
  position: relative;
  width: 1rem;
  height: 1rem;
}

.tech-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 1rem;
  height: 1rem;
}

.checkbox-label {
  position: absolute;
  inset: 0;
  cursor: pointer;
  background: transparent;
  border: 1px solid #607B96;
  border-radius: 2px;
  transition: all 0.2s;
}

.tech-checkbox:checked + .checkbox-label {
  background-color: #607B96;
  border-color: #607B96;
}

.tech-checkbox:checked + .checkbox-label::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0.25rem;
  height: 0.5rem;
  border: 1px solid white;
  border-top: none;
  border-left: none;
  transform: translate(-50%, -65%) rotate(45deg);
}

.tech-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.tech-icon-placeholder {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  border-radius: 0.125rem;
  border: 1px solid rgba(30, 45, 61, 0.4);
}

.tech-name {
  font-size: 0.875rem;
  font-family: Fira Code, monospace;
  color: #607B96;
  flex-grow: 1;
}
</style>
