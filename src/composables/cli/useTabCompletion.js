import { ref } from "vue";

export function useTabCompletion(getSuggestions) {
  const suggestions = ref([]);
  const activeIndex = ref(0);

  function clear() {
    suggestions.value = [];
    activeIndex.value = 0;
  }

  function next(partial, backwards) {
    if (!partial) return null;
    if (!suggestions.value.length) {
      const matches = getSuggestions(partial);
      if (!matches.length) return null;
      if (matches.length === 1) return matches[0];
      suggestions.value = matches;
      activeIndex.value = 0;
    } else {
      const step = backwards ? -1 : 1;
      activeIndex.value = (activeIndex.value + step + suggestions.value.length) % suggestions.value.length;
    }
    return suggestions.value[activeIndex.value];
  }

  const highlighted = () => suggestions.value[activeIndex.value];

  return { suggestions, activeIndex, clear, next, highlighted };
}
