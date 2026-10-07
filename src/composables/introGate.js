import { ref } from "vue";

const SEEN_KEY = "intro-loader-seen";

function hasSeenIntro() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    return;
  }
}

export const loaderActive = ref(!hasSeenIntro());

let resolveIntro = null;
export const introDone = loaderActive.value
  ? new Promise((resolve) => { resolveIntro = resolve; })
  : Promise.resolve();

export function finishIntro() {
  markIntroSeen();
  loaderActive.value = false;
  resolveIntro?.();
}
