// utils/authControl.ts
// tiny module to "defer" AppNavigator switching from anywhere, no React Context needed.

type Listener = (defer: boolean) => void;

let defer = false;
const listeners: Listener[] = [];

export function setDefer(value: boolean) {
  defer = value;
  listeners.forEach((l) => {
    try { l(defer); } catch (e) { /* ignore */ }
  });
}

export function getDefer() {
  return defer;
}

export function subscribe(fn: Listener) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}
