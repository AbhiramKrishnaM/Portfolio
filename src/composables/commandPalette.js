import { ref } from "vue";

/** Whether the Cmd/Ctrl + K command palette is open. */
export const paletteOpen = ref(false);

/**
 * Game id the palette asked to launch. The landing page (index.vue) owns the
 * game panel, so it watches this, launches the game, and clears it.
 */
export const pendingGame = ref(null);
