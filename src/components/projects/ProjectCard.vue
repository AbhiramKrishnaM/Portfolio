<template>
  <article class="project-card h-full flex flex-col gap-4 p-5" :aria-label="`Project ${index + 1}: ${project.name}`">
    <header class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span class="text-accent-sub font-medium shrink-0">Project {{ index + 1 }}</span>
      <span class="text-gray-gradient-01">// _{{ project.slug }}</span>

      <div class="ml-auto flex items-center gap-1 shrink-0 text-gray-gradient-01">
        <button type="button" class="pager-btn" aria-label="Previous project" data-cursor="prev" @click="$emit('prev')">
          &lt;
        </button>
        <span class="text-xs tabular-nums">{{ index + 1 }}/{{ total }}</span>
        <button type="button" class="pager-btn" aria-label="Next project" data-cursor="next" @click="$emit('next')">
          &gt;
        </button>
      </div>
    </header>

    <div class="relative lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
      <div class="preview aspect-video lg:aspect-auto lg:flex-1 lg:min-h-0 overflow-hidden">
        <img v-if="project.image" :src="project.image" :alt="`${project.name} preview`"
          class="w-full h-full object-cover" loading="lazy" />
        <div v-else class="preview-placeholder w-full h-full flex flex-col items-center justify-center gap-1 px-4 text-center">
          <span class="text-white-gradient-01 text-lg">{{ project.name }}</span>
          <span class="text-gray-gradient-01 text-xs">// preview coming soon</span>
        </div>
      </div>

      <ul class="absolute -bottom-5 right-4 flex -space-x-2" aria-label="Tech stack">
        <li v-for="key in project.tech" :key="key" class="tech-badge" :title="TECH[key].title"
          :data-cursor="TECH[key].title">
          <svg viewBox="0 0 24 24" fill="currentColor" role="img" :aria-label="TECH[key].title">
            <path :d="TECH[key].path" />
          </svg>
        </li>
      </ul>
    </div>

    <p class="text-gray-gradient-01 text-sm leading-relaxed pt-3 pr-6">{{ project.desc }}</p>

    <a :href="project.demo ?? project.url" target="_blank" rel="noopener noreferrer"
      class="view-btn self-start text-sm" data-cursor="open project">
      view-project
    </a>
  </article>
</template>

<script setup>
import { TECH } from "@/data/projects.js";

defineProps({
  project: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

defineEmits(["prev", "next"]);
</script>

<style scoped>
.project-card {
  width: 100%;
  background: linear-gradient(150deg,
      rgba(1, 22, 39, 0.95) 0%,
      rgba(1, 18, 33, 0.98) 100%);
  border: 1px solid var(--color-border-white);
  border-radius: 8px;
  transition: background 0.3s ease, border-color 0.3s ease;
}

:root[data-theme="light"] .project-card {
  background: linear-gradient(150deg,
      rgba(255, 255, 255, 0.97) 0%,
      rgba(239, 244, 248, 0.98) 100%);
  box-shadow: 0px 12px 32px rgba(11, 32, 54, 0.1);
}

.preview {
  border: 1px solid var(--color-border-white);
  border-radius: 8px;
  background-color: var(--color-bg-field-default);
}

.preview-placeholder {
  background-image:
    linear-gradient(var(--color-border-white) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-border-white) 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: center;
}

.tech-badge {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid var(--color-border-white);
  background-color: var(--color-theme-main);
  color: var(--color-accent-variable);
}

.tech-badge svg {
  width: 1.15rem;
  height: 1.15rem;
}

.pager-btn {
  padding: 0 0.35rem;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.pager-btn:hover {
  color: var(--color-accent-variable);
}

.view-btn {
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--color-accent-variable);
  border-radius: 8px;
  color: var(--color-accent-variable);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.view-btn:hover {
  background-color: var(--color-accent-variable);
  color: var(--color-theme-main);
}
</style>
