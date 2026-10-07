<template>
  <div class="flex flex-col gap-0.5">
    <template v-for="line in lines" :key="line.id">
      <div v-if="line.type === 'blank'" class="h-2" />

      <div v-else-if="line.type === 'input'" class="flex items-center gap-2">
        <span class="text-accent-variable text-sm">$</span>
        <span class="text-white-gradient-01 text-sm">{{ line.content }}</span>
        <span v-if="line.cursor" class="typing-cursor" />
      </div>

      <div v-else-if="line.type === 'comment'" class="pl-5 text-gray-gradient-01 text-xs italic">
        {{ line.content }}
      </div>

      <p v-else-if="line.type === 'text'" class="pl-5 text-sm text-white-gradient-01 leading-relaxed">
        {{ line.content }}
      </p>

      <div v-else-if="line.type === 'job'" class="pl-5 text-sm flex flex-col gap-0.5 mb-1">
        <div class="flex flex-wrap items-baseline gap-x-2">
          <span class="text-accent-url font-medium">{{ line.content.company }}</span>
          <span class="text-white-gradient-01">{{ line.content.role }}</span>
          <span class="text-gray-gradient-01 text-xs">({{ line.content.dates }})</span>
        </div>
        <div v-for="(point, i) in line.content.points" :key="i" class="flex gap-2 pl-2 text-gray-gradient-01">
          <span class="text-accent-variable shrink-0">&gt;</span>
          <span>{{ point }}</span>
        </div>
      </div>

      <div v-else-if="line.type === 'pair'" class="pl-5 flex gap-3 text-sm">
        <span class="text-accent-underline font-medium w-14 shrink-0">
          {{ line.content.label }}
        </span>
        <span class="text-white-gradient-01">{{ line.content.value }}</span>
      </div>

      <div v-else-if="line.type === 'link'" class="pl-5 text-sm flex items-center gap-2">
        <a :href="line.content.url" target="_blank" rel="noopener noreferrer"
          class="text-accent-url hover:underline cursor-pointer">
          {{ line.content.text }}
        </a>
      </div>

      <button v-else-if="line.type === 'project-row'" type="button"
        class="project-row pl-5 flex items-baseline gap-2 text-sm text-left"
        :class="{ 'project-row--selected': line.content.slug === selectedProject }"
        :aria-pressed="line.content.slug === selectedProject" :data-cursor="line.content.name"
        @mouseenter="$emit('project-select', line.content.slug)" @focus="$emit('project-select', line.content.slug)"
        @click="$emit('project-select', line.content.slug)">
        <span class="project-row-marker text-accent-variable shrink-0">></span>
        <span class="text-accent-url font-medium shrink-0">{{ line.content.name }}</span>
        <span class="text-gray-gradient-01">— {{ line.content.desc }}</span>
      </button>

      <div v-else-if="line.type === 'help-row'" class="pl-5 flex gap-3 text-sm">
        <span class="text-accent-variable w-28 shrink-0 font-medium">
          {{ line.content.cmd }}
        </span>
        <span class="text-gray-gradient-01">{{ line.content.desc }}</span>
      </div>

      <div v-else-if="line.type === 'commit-row'" class="pl-5 flex flex-wrap items-baseline gap-x-2 text-sm">
        <a :href="line.content.url" target="_blank" rel="noopener noreferrer"
          class="text-accent-underline hover:underline shrink-0" :data-cursor="`view ${line.content.sha}`">{{ line.content.sha }}</a>
        <span class="text-white-gradient-01 min-w-0 break-words">{{ line.content.message }}</span>
        <span class="text-gray-gradient-01 text-xs shrink-0">({{ line.content.repo }}, {{ line.content.ago }})</span>
      </div>

      <div v-else-if="line.type === 'achievement-row'" class="pl-5 flex items-baseline gap-2 text-sm">
        <span class="shrink-0 w-4" :class="line.content.unlocked ? 'text-accent-variable' : 'text-gray-gradient-01'"
          :aria-label="line.content.unlocked ? 'unlocked' : 'locked'">{{ line.content.unlocked ? "✓" : "·" }}</span>
        <span class="shrink-0 font-medium" :class="line.content.unlocked ? 'text-white-gradient-01' : 'text-gray-gradient-01'">{{ line.content.name }}</span>
        <span class="text-gray-gradient-01">— {{ line.content.desc }}</span>
      </div>

      <pre v-else-if="line.type === 'pre'" class="pl-5 text-xs leading-snug whitespace-pre overflow-hidden"
        :class="line.content.tone === 'accent' ? 'text-accent-variable' : 'text-white-gradient-01'"
        role="img" :aria-label="line.content.label">{{ line.content.text }}</pre>

      <div v-else-if="line.type === 'error'" class="pl-5 text-red-400 text-sm">
        {{ line.content }}
      </div>

      <GameSelectMenu v-else-if="line.type === 'game-menu'" :games="line.content.games"
        :selected-index="menuState?.selectedIndex ?? 0" :frozen-index="line.content.frozenIndex" />
    </template>
  </div>
</template>

<script setup>
import GameSelectMenu from "./GameSelectMenu.vue";

defineProps({
  lines: {
    type: Array,
    required: true,
  },
  menuState: {
    type: Object,
    default: null,
  },
  selectedProject: {
    type: String,
    default: null,
  },
});

defineEmits(["project-select"]);
</script>

<style scoped>
.project-row-marker {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.project-row:hover .project-row-marker,
.project-row--selected .project-row-marker {
  opacity: 1;
}

.typing-cursor {
  display: inline-block;
  width: 7px;
  height: 13px;
  background-color: currentColor;
  animation: blink 0.75s step-end infinite;
  vertical-align: middle;
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}
</style>
