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
      <div class="tech-badges">
        <div
          v-for="(tech, index) in projectMeta.tech_used.slice(0, 3)"
          :key="tech"
          class="tech-badge"
          :style="{ right: `${index * 24 + 12}px`, zIndex: index + 1 }"
          @mouseenter="animateTechIcon($event, 'hover')"
          @mouseleave="animateTechIcon($event, 'leave')"
        >
          <img :src="getTechIcon(tech)" :alt="tech" class="tech-icon" />
        </div>
        <div
          v-if="projectMeta.tech_used.length > 3"
          class="tech-badge more-badge"
          style="right: 84px; z-index: 4"
          @mouseenter="animateTechIcon($event, 'hover')"
          @mouseleave="animateTechIcon($event, 'leave')"
        >
          <span class="more-icon">+{{ projectMeta.tech_used.length - 3 }}</span>
        </div>
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
import { gsap } from "gsap";

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
    react: "/icons/reactjs.svg",
    nextjs: "/icons/nextjs.svg",
    vuejs: "/icons/vuejs.svg",
    nuxtjs: "/icons/nuxtjs.svg",
    nodejs: "/icons/nodejs-icon.svg",
    express: "/icons/express-icon.svg",
    typescript: "/icons/typescript.svg",
    javascript: "/icons/javascript-icon.svg",
    go: "/icons/go.svg",
    django: "/icons/django-icon.svg",
    python: "/icons/python-icon.svg",
    fastapi: "/icons/fastapi.svg",
    vercel: "/icons/vercel.svg",
    reactnative: "/icons/react-native.svg",
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

const animateTechIcon = (event, action) => {
  const target = event.currentTarget;

  if (action === "hover") {
    gsap.killTweensOf(target); // Kill any existing animations
    gsap.to(target, {
      y: -8,
      scale: 1.15,
      duration: 0.4,
      ease: "power3.out",
      boxShadow: "0 12px 30px rgba(0, 0, 0, 0.4)",
      force3D: true, // Force hardware acceleration
    });
  } else {
    gsap.killTweensOf(target); // Kill any existing animations
    gsap.to(target, {
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: "power3.out",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
      force3D: true, // Force hardware acceleration
    });
  }
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

.tech-badges {
  @apply absolute top-8 right-1 flex items-center;
  isolation: isolate; /* Create new stacking context */
}

.tech-badge {
  @apply w-8 h-8 bg-accent-sub rounded-md flex items-center justify-center border-2 border-white shadow-md;
  position: absolute;
  transform-origin: center bottom;
  will-change: transform, box-shadow; /* Optimize for animations */
  backface-visibility: hidden; /* Prevent flickering */
  perspective: 1000px; /* Improve 3D transforms */
  transform: translateZ(0); /* Force GPU acceleration */
}

.tech-icon {
  @apply w-5 h-5;
  pointer-events: none; /* Prevent icon from interfering with hover */
}

.more-badge {
  @apply w-8 h-8 bg-accent-color rounded-md flex items-center justify-center border-2 border-white shadow-md;
  transform-origin: center bottom;
  will-change: transform, box-shadow; /* Optimize for animations */
  backface-visibility: hidden; /* Prevent flickering */
  perspective: 1000px; /* Improve 3D transforms */
  transform: translateZ(0); /* Force GPU acceleration */
}

.more-icon {
  @apply text-xs font-bold text-white font-mono;
  pointer-events: none; /* Prevent icon from interfering with hover */
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
