<template>
  <div class="project-card">
    <div class="project-header">
      <h3 class="project-title">
        <span class="project-number">{{ projectNumber }}</span>
        <span class="project-separator"> // </span>
        <span class="project-name">{{ title }}</span>
      </h3>
    </div>

    <div class="project-image-container">
      <img :src="imageUrl" :alt="title" class="project-image" />
      <div class="tech-badge">
        <img
          :src="getTechIcon(projectMeta.tech_used[0])"
          :alt="projectMeta.tech_used[0]"
          class="tech-icon"
        />
      </div>
    </div>

    <div
      class="border-l border-r border-b rounded-b-lg px-6 pb-8 border-border-white bg-[#011221]"
    >
      <div class="project-description">
        <p class="line-clamp-2">{{ description }}</p>
      </div>

      <div class="project-actions">
        <a
          :href="githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="view-project-btn"
        >
          view-project
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  githubUrl: {
    type: String,
    required: true,
  },
  projectMeta: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && Array.isArray(value.tech_used);
    },
  },
});

const projectNumber = computed(() => {
  return `Project ${props.id}`;
});

const getTechIcon = (tech) => {
  const techIcons = {
    react: "/icons/react-icon.svg",
    nextjs: "/icons/react-icon.svg",
    vuejs: "/icons/vue-icon.svg",
    nuxtjs: "/icons/vue-icon.svg",
    nodejs: "/icons/nodejs-icon.svg",
    express: "/icons/express-icon.svg",
    typescript: "/icons/typescript-icon.svg",
    javascript: "/icons/javascript-icon.svg",
    go: "/icons/go-icon.svg",
    django: "/icons/django-icon.svg",
    python: "/icons/python-icon.svg",
    fastapi: "/icons/python-icon.svg",
    vercel: "/icons/vercel-icon.svg",
    reactnative: "/icons/react-icon.svg",
    threejs: "/icons/threejs-icon.svg",
    html: "/icons/html-icon.svg",
    css: "/icons/css-icon.svg",
    postgres: "/icons/postgres-icon.svg",
    docker: "/icons/docker-icon.svg",
    aws: "/icons/aws-icon.svg",
    tailwind: "/icons/tailwind-icon.svg",
    git: "/icons/git-icon.svg",
  };

  return techIcons[tech.toLowerCase()] || "/icons/git-icon.svg";
};
</script>

<style scoped>
.project-card {
  @apply rounded-lg p-6  hover:border-accent-color transition-all duration-300 flex flex-col min-h-96;
}

.project-header {
  @apply mb-4;
}

.project-title {
  @apply text-sm font-mono font-medium text-accent-color m-0;
}

.project-number {
  @apply text-accent-sub;
}

.project-separator {
  @apply text-accent-color;
}

.project-name {
  @apply text-accent-color;
}

.project-image-container {
  @apply relative rounded-t-lg overflow-hidden h-48 border border-border-white;
}

.project-image {
  @apply w-full h-full object-cover;
}

.tech-badge {
  @apply absolute top-3 right-3 w-8 h-8 bg-accent-sub rounded-md flex items-center justify-center;
}

.tech-icon {
  @apply w-5 h-5 brightness-0 invert;
}

.project-description {
  @apply flex-grow mb-6 pt-4;
}

.project-description p {
  @apply text-sm font-mono text-accent-color leading-relaxed m-0 line-clamp-2;
}

.project-actions {
  @apply mt-auto;
}

.view-project-btn {
  @apply inline-block px-4 py-2 rounded font-mono text-sm transition-colors duration-200 bg-border-white text-accent-color border border-border-white no-underline;
}

.view-project-btn:hover {
  @apply bg-accent-color text-theme-main border-accent-color;
}
</style>
