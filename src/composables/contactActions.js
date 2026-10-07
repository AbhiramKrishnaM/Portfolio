import { EMAIL } from "@/data/socials.js";
import { RESUME } from "@/data/profile.js";
import { notify, notifyError } from "@/composables/notify.js";

export const hasResume = () => Boolean(RESUME.url);

export function downloadResume() {
  if (!hasResume()) {
    notify("// resume coming soon", "meanwhile, LinkedIn has the full story");
    return false;
  }
  const link = document.createElement("a");
  link.href = RESUME.url;
  link.download = RESUME.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  return true;
}

export async function copyEmail() {
  try {
    await navigator.clipboard.writeText(EMAIL);
    notify("// copied to clipboard", EMAIL);
    return true;
  } catch {
    notifyError("// couldn't copy — here it is", EMAIL);
    return false;
  }
}
