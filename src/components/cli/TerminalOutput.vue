<template>
  <div class="flex flex-col gap-0.5">
    <template v-for="line in lines" :key="line.id">
      <!-- blank spacer -->
      <div v-if="line.type === 'blank'" class="h-2" />

      <!-- echoed user input -->
      <div v-else-if="line.type === 'input'" class="flex items-center gap-2">
        <span class="text-accent-variable text-sm">$</span>
        <span class="text-white-gradient-01 text-sm">{{ line.content }}</span>
        <span v-if="line.cursor" class="typing-cursor" />
      </div>

      <!-- pixel name block -->
      <PixelName
        v-else-if="line.type === 'pixel-name'"
        :text="line.content"
      />

      <!-- comment  // ... -->
      <div
        v-else-if="line.type === 'comment'"
        class="pl-5 text-gray-gradient-01 text-xs italic"
      >
        {{ line.content }}
      </div>

      <!-- key / value pair  LABEL   value -->
      <div v-else-if="line.type === 'pair'" class="pl-5 flex gap-3 text-sm">
        <span class="text-accent-underline font-medium w-14 shrink-0">
          {{ line.content.label }}
        </span>
        <span class="text-white-gradient-01">{{ line.content.value }}</span>
      </div>

      <!-- clickable link -->
      <div v-else-if="line.type === 'link'" class="pl-5 text-sm">
        <a
          :href="line.content.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-accent-url hover:underline cursor-pointer"
        >
          {{ line.content.text }}
        </a>
      </div>

      <!-- help row  cmd    desc -->
      <div v-else-if="line.type === 'help-row'" class="pl-5 flex gap-3 text-sm">
        <span class="text-accent-variable w-28 shrink-0 font-medium">
          {{ line.content.cmd }}
        </span>
        <span class="text-gray-gradient-01">{{ line.content.desc }}</span>
      </div>

      <!-- error -->
      <div
        v-else-if="line.type === 'error'"
        class="pl-5 text-red-400 text-sm"
      >
        {{ line.content }}
      </div>

      <!-- game-menu — inline interactive picker -->
      <GameSelectMenu
        v-else-if="line.type === 'game-menu'"
        :games="line.content.games"
        :selected-index="menuState?.selectedIndex ?? 0"
        :frozen-index="line.content.frozenIndex"
      />
    </template>
  </div>
</template>

<script setup>
import GameSelectMenu from "./GameSelectMenu.vue";
import PixelName from "./PixelName.vue";

defineProps({
  lines: {
    type: Array,
    required: true,
  },
  /**
   * Passed down from TerminalWindow so GameSelectMenu knows which
   * item is currently highlighted without storing it in the line itself.
   */
  menuState: {
    type: Object,
    default: null,
  },
});
</script>

<style scoped>
.typing-cursor {
  display: inline-block;
  width: 7px;
  height: 13px;
  background-color: currentColor;
  animation: blink 0.75s step-end infinite;
  vertical-align: middle;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
</style>
