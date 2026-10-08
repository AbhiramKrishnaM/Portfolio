const listeners = new Set();

export function onKeystroke(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitKeystroke(key) {
  listeners.forEach((fn) => fn(key));
}
