<template>
  <div class="py-1 pl-4 select-none">
    <div
      v-for="(game, i) in games"
      :key="game.id"
      class="flex items-center gap-3 py-0.5 leading-relaxed"
    >
      <span
        class="w-3 text-sm font-bold transition-colors duration-100"
        :class="isSelected(i) ? 'text-accent-variable' : 'text-transparent'"
      >
        &gt;
      </span>

      <span
        class="text-sm transition-colors duration-100"
        :class="labelClass(i, game)"
      >
        {{ game.label }}
      </span>

      <span class="text-xs text-gray-gradient-01">
        {{ game.description }}
      </span>

      <span
        v-if="game.comingSoon"
        class="text-xs text-accent-underline opacity-70"
      >
        // coming soon
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  games: {
    type: Array,
    required: true,
  },
  selectedIndex: {
    type: Number,
    default: 0,
  },
  frozenIndex: {
    type: Number,
    default: null,
  },
});

const isFrozen = () => props.frozenIndex !== null;

function isSelected(i) {
  if (isFrozen()) return i === props.frozenIndex;
  return i === props.selectedIndex;
}

function labelClass(i, game) {
  if (game.comingSoon) return "text-gray-gradient-01 opacity-50";
  if (isSelected(i)) return "text-accent-variable";
  return "text-white-gradient-01";
}
</script>
