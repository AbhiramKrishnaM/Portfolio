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
          <img :src="tech.icon" :alt="tech.name" class="tech-icon" />
          <span class="tech-name">{{ tech.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  selectedTechs: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:selectedTechs"]);

const isDropdownOpen = ref(true);

const availableTechs = ref([
  { id: "react", name: "React", icon: "/icons/react-icon.svg" },
  { id: "html", name: "HTML", icon: "/icons/html-icon.svg" },
  { id: "css", name: "CSS", icon: "/icons/css-icon.svg" },
  { id: "vuejs", name: "Vue", icon: "/icons/vue-icon.svg" },
  { id: "angular", name: "Angular", icon: "/icons/angular-icon.svg" },
  { id: "gatsby", name: "Gatsby", icon: "/icons/gatsby-icon.svg" },
  { id: "flutter", name: "Flutter", icon: "/icons/flutter-icon.svg" },
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

const selectedTechNames = computed(() => {
  return props.selectedTechs
    .map(
      (techId) => availableTechs.value.find((tech) => tech.id === techId)?.name
    )
    .filter(Boolean);
});
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
  @apply flex items-center space-x-3 cursor-pointer py-4 px-2 rounded hover:bg-border-white transition-colors duration-200;
}

.checkbox-container {
  @apply relative w-4 h-4;
}

.tech-checkbox {
  @apply absolute opacity-0 cursor-pointer w-4 h-4;
}

.checkbox-label {
  @apply absolute inset-0 cursor-pointer bg-transparent border border-accent-color rounded-sm transition-all duration-200;
}

.tech-checkbox:checked + .checkbox-label {
  @apply bg-accent-sub border-accent-sub;
}

.tech-checkbox:checked + .checkbox-label::after {
  content: "";
  @apply absolute left-1 top-0 w-1.5 h-2.5 border-white border-r-2 border-b-2 rotate-45;
}

.tech-icon {
  @apply w-5 h-5 flex-shrink-0;
}

.tech-name {
  @apply text-sm font-mono text-accent-color flex-grow;
}
</style>
