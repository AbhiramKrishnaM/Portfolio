<template>
  <div class="stack-tile terminal-panel" :style="{ '--tile-brand': brandColor }">
    <svg v-if="item.icon" class="stack-tile__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path :d="item.icon.path" />
    </svg>
    <span v-else class="stack-tile__text" aria-hidden="true">{{ item.id }}</span>
    <span class="stack-tile__label">{{ item.name }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const brandColor = computed(() => (props.item.icon ? `#${props.item.icon.hex}` : "var(--color-accent-underline)"));
</script>

<style scoped>
.stack-tile {
  width: var(--tile-size, 88px);
  height: var(--tile-size, 88px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  user-select: none;
}

.stack-tile__icon {
  width: 42%;
  height: 42%;
  fill: var(--tile-brand);
}

.stack-tile__text {
  font-size: calc(var(--tile-size, 88px) * 0.26);
  font-weight: 600;
  color: var(--tile-brand);
  line-height: 1;
}

.stack-tile__label {
  font-size: 0.7rem;
  color: var(--color-gray-gradient-01);
}
</style>
