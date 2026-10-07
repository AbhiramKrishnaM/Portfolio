<template>
  <PageSection id="experience" command="experience" title="Experience">
    <ol class="timeline relative flex flex-col gap-8 pl-6 sm:pl-8">
      <li v-for="job in EXPERIENCE" :key="job.company" class="relative">
        <span class="timeline-dot" :class="{ 'timeline-dot--current': job.current }" aria-hidden="true" />
        <article class="terminal-panel p-5 sm:p-6">
          <header class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
            <div>
              <h3 class="text-lg text-white-gradient-01">{{ job.company }}</h3>
              <p class="text-sm text-accent-sub">{{ job.role }}</p>
            </div>
            <p class="text-xs text-gray-gradient-01 shrink-0">{{ job.dates }}</p>
          </header>
          <ul class="mt-4 flex flex-col gap-2 text-sm text-gray-gradient-01">
            <li v-for="(point, i) in job.points" :key="i" class="flex gap-2">
              <span class="text-accent-variable shrink-0" aria-hidden="true">&gt;</span>
              <span>{{ point }}</span>
            </li>
          </ul>
        </article>
      </li>
    </ol>
  </PageSection>
</template>

<script setup>
import PageSection from "@/components/sections/PageSection.vue";
import { EXPERIENCE } from "@/data/experience.js";
</script>

<style scoped>
.timeline::before {
  content: "";
  position: absolute;
  left: 0.3rem;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 1px;
  background-color: var(--color-border-white);
}

.timeline-dot {
  position: absolute;
  left: calc(-1.5rem + 0.05rem);
  top: 1.6rem;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 9999px;
  background-color: var(--color-theme-main);
  border: 1px solid var(--color-accent-variable);
}

.timeline-dot--current {
  background-color: var(--color-accent-variable);
}

@media (min-width: 640px) {
  .timeline-dot {
    left: calc(-2rem + 0.05rem);
  }
}
</style>
