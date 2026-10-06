import { ref, onMounted, onUnmounted } from "vue";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]|:;<>,.?/";
const SCRAMBLE_INTERVAL_MS = 150;
const SCRAMBLE_STEPS = 10;
const HOLD_MS = 2000;
const ZERO_WIDTH_SPACE = "​";

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

export function useHackingText(words) {
  const maxLength = Math.max(...words.map((w) => w.length));
  const toLetters = (word) => word.padEnd(maxLength, " ").split("").map((c) => (c === " " ? ZERO_WIDTH_SPACE : c));

  let wordIndex = 0;
  const currentText = ref(toLetters(words[wordIndex]));
  const randomCharsTop = ref([]);
  const randomCharsBottom = ref([]);
  let scrambleTimer = null;
  let holdTimer = null;

  const randomRow = () => currentText.value.map(() => randomGlyph());

  function refreshRandomRows() {
    randomCharsTop.value = randomRow();
    randomCharsBottom.value = randomRow();
  }

  function scrambleToNextWord() {
    let steps = 0;
    const nextWord = toLetters(words[(wordIndex + 1) % words.length]);

    scrambleTimer = setInterval(() => {
      randomCharsTop.value = randomRow();
      currentText.value = [...randomCharsBottom.value];
      randomCharsBottom.value = randomRow();

      steps++;
      if (steps >= SCRAMBLE_STEPS) {
        clearInterval(scrambleTimer);
        currentText.value = nextWord;
        refreshRandomRows();
        wordIndex = (wordIndex + 1) % words.length;
        holdTimer = setTimeout(scrambleToNextWord, HOLD_MS);
      }
    }, SCRAMBLE_INTERVAL_MS);
  }

  onMounted(() => {
    refreshRandomRows();
    holdTimer = setTimeout(scrambleToNextWord, HOLD_MS);
  });

  onUnmounted(() => {
    clearInterval(scrambleTimer);
    clearTimeout(holdTimer);
  });

  return { currentText, randomCharsTop, randomCharsBottom };
}
