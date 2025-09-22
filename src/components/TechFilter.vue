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

      <div class="pl-2 pt-4" v-show="isDropdownOpen">
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

const props = defineProps({
  selectedTechs: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:selectedTechs"]);

const isDropdownOpen = ref(true);

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
  @apply w-64  bg-theme-main border-r border-border-white h-screen overflow-y-auto;
}

.filter-title {
  @apply text-sm font-mono font-medium text-accent-color;
}

.dropdown-arrow {
  @apply transition-transform duration-200 text-accent-color;
}

.dropdown-arrow.rotated {
  @apply rotate-180;
}

.filter-option {
  @apply flex items-center space-x-3 cursor-pointer py-3 px-2 rounded hover:bg-border-white transition-colors duration-200;
}

.checkbox-container {
  @apply relative w-4 h-4;
}

.tech-checkbox {
  @apply absolute opacity-0 cursor-pointer w-4 h-4;
}

.checkbox-label {
  @apply absolute inset-0 cursor-pointer bg-transparent border transition-all duration-200;
  border-color: #607b96;
  border-radius: 2px;
}

.tech-checkbox:checked + .checkbox-label {
  background-color: #607b96;
  border-color: #607b96;
}

.tech-checkbox:checked + .checkbox-label::after {
  content: "";
  @apply absolute left-1/2 top-1/2 w-1 h-2 border-white border-r border-b;
  transform: translate(-50%, -65%) rotate(45deg);
}

.tech-icon {
  @apply w-5 h-5 flex-shrink-0;
}

.tech-icon-placeholder {
  @apply w-5 h-5 flex-shrink-0 rounded-sm border border-border-white/40;
}

.tech-name {
  @apply text-sm font-mono text-accent-color flex-grow;
}
</style>
