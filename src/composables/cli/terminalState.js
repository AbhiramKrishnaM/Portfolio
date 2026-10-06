import { ref } from "vue";

let lastLineId = 0;
export const nextLineId = () => ++lastLineId;

export function createTerminalState() {
  const lines = ref([]);
  const menuState = ref(null);
  const booting = ref(false);
  const overlay = ref(null);
  const columns = ref(60);

  const addLine = (type, content) => lines.value.push({ id: nextLineId(), type, content });
  const blank = () => addLine("blank", null);
  const addLink = ({ text, url }) => addLine("link", { text, url });

  const addPre = (text, label, tone = "text") => {
    const id = nextLineId();
    lines.value.push({ id, type: "pre", content: { text, label, tone } });
    return id;
  };

  const replaceLine = (id, line) => {
    const idx = lines.value.findIndex((l) => l.id === id);
    if (idx === -1) return false;
    lines.value[idx] = { id, ...line };
    return true;
  };

  const removeLine = (id) => {
    lines.value = lines.value.filter((l) => l.id !== id);
  };

  return { lines, menuState, booting, overlay, columns, addLine, blank, addLink, addPre, replaceLine, removeLine };
}
