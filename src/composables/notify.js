import { toast } from "vue-sonner";

export function notify(title, description) {
  toast(title, { description });
}

export function notifyError(title, description) {
  toast.error(title, { description });
}

export function notifyAchievement(achievement) {
  notify("// achievement unlocked", `${achievement.name} — ${achievement.desc}`);
}
