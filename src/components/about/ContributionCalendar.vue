<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-2 text-sm">
      <p class="text-gray-gradient-01">
        <span class="text-white-gradient-01">{{ total }} contributions</span> in the last year
        <span class="hidden lg:inline">· lit up on the grid below</span>
      </p>
      <a :href="profileUrl" target="_blank" rel="noopener noreferrer" class="text-gray-gradient-01 hover:text-accent-url"
        data-cursor="github">@{{ CONTRIBUTIONS.user }} ↗</a>
    </div>
    <div class="calendar overflow-x-auto scrollbar-none" role="img"
      :aria-label="`${total} GitHub contributions in the last year`">
      <span v-for="day in CONTRIBUTIONS.days" :key="day.date" class="calendar-day" :data-level="day.level" />
    </div>
  </div>
</template>

<script setup>
import CONTRIBUTIONS from "@/data/contributions.json";

const total = CONTRIBUTIONS.total.toLocaleString("en-US");
const profileUrl = `https://github.com/${CONTRIBUTIONS.user}`;
</script>

<style scoped>
.calendar {
  display: grid;
  grid-template-rows: repeat(7, 0.6rem);
  grid-auto-flow: column;
  grid-auto-columns: 0.6rem;
  gap: 2px;
}

@media (min-width: 1024px) {
  .calendar {
    display: none;
  }
}

.calendar-day {
  border-radius: 2px;
  background-color: var(--color-border-white);
}

.calendar-day[data-level="1"] {
  background-color: color-mix(in srgb, var(--color-accent-variable) 35%, transparent);
}

.calendar-day[data-level="2"] {
  background-color: color-mix(in srgb, var(--color-accent-variable) 55%, transparent);
}

.calendar-day[data-level="3"] {
  background-color: color-mix(in srgb, var(--color-accent-variable) 80%, transparent);
}

.calendar-day[data-level="4"] {
  background-color: var(--color-accent-variable);
}
</style>
