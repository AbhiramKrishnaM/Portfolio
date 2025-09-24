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
      <div class="flex-1 overflow-y-auto bg-theme-main">
        <!-- Sub-navbar: selected filters only -->
        <div
          class="flex items-center justify-end border-b border-border-white px-6 h-12"
        >
          <div v-if="selectedTechNames.length > 0" class="flex items-center">
            <div
              class="flex items-center space-x-2 px-3 py-1 rounded bg-border-white border border-border-white"
            >
              <span class="text-xs md:text-sm">{{
                selectedTechNames.join("; ")
              }}</span>
              <button
                @click="clearFilters"
                class="p-1 hover:bg-gray-700 rounded transition-colors duration-200"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
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
        </div>

        <div class="p-6">
          <div
            class="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
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

const {
  selectedTechs,
  filteredProjects,
  selectedTechNames,
  updateSelectedTechs,
} = useProjects();

const clearFilters = () => {
  updateSelectedTechs([]);
};
</script>
