<template>
  <div class="min-h-screen bg-theme-main text-accent-color font-mono">
    <div class="flex h-screen">
      <!-- Sidebar with Tech Filters -->
      <div class="flex-shrink-0 w-64">
        <TechFilter
          v-model:selectedTechs="selectedTechs"
          @update:selectedTechs="updateSelectedTechs"
        />
      </div>

      <!-- Main Projects Area -->
      <div class="flex-1 flex flex-col bg-theme-main">
        <!-- Sub-navbar: selected filters only - FIXED POSITION -->
        <div
          class="flex items-center justify-start border-b border-border-white px-4 h-12 flex-shrink-0"
        >
          <div
            v-if="selectedTechNames.length > 0"
            class="flex items-center gap-2 pr-4 border-r border-border-white h-full"
          >
            <span class="text-xs md:text-sm text-accent-color font-mono">{{
              selectedTechNames.join("; ")
            }}</span>
            <button
              @click="clearFilters"
              class="p-0.5 hover:opacity-70 transition-opacity duration-200"
              aria-label="Clear filters"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path
                  d="M9 3L3 9M3 3L9 9"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Scrollable Projects Grid -->
        <div
          class="overflow-y-auto scrollbar-custom p-6 pb-8"
          :style="{ height: `${availableHeight}px` }"
        >
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
          >
            <ProjectCard
              v-for="project in filteredProjects"
              :key="project.id"
              :id="project.id"
              :title="project.title"
              :description="project.description"
              :image-url="project.imageUrl"
              :github-url="project.githubUrl"
              :project-meta="project.projectMeta"
            />
          </div>

          <div
            v-if="filteredProjects.length === 0"
            class="flex items-center justify-center h-64"
          >
            <p class="text-lg font-mono text-accent-color">
              No projects found with the selected filters.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import ProjectCard from "../components/ProjectCard.vue";
import TechFilter from "../components/TechFilter.vue";
import { useProjects } from "../composables/useProjects.js";
import { useDynamicHeight } from "../composables/useDynamicHeight.js";

const {
  selectedTechs,
  filteredProjects,
  selectedTechNames,
  updateSelectedTechs,
} = useProjects();

const { availableHeight } = useDynamicHeight(120);

const clearFilters = () => {
  updateSelectedTechs([]);
};
</script>
