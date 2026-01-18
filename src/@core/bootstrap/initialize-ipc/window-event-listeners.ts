import type { BrowserWindow, WebContents } from "electron";
import type { TWindowManagerWithHandlers } from "../../types/window-manager.js";

type TEventEmitter = Pick<
  BrowserWindow | WebContents,
  "on" | "off" | "removeListener"
>;

type TWindowListenerEntry = {
  instance: TWindowManagerWithHandlers;
  cleanup: Array<() => void>;
};

const windowListeners = new WeakMap<BrowserWindow, TWindowListenerEntry>();

const getPrototypeMethodNames = (instance: object): string[] => {
  const names = new Set<string>();
  let proto = Object.getPrototypeOf(instance);
  while (proto && proto !== Object.prototype) {
    Object.getOwnPropertyNames(proto).forEach(
      (n) => n !== "constructor" && names.add(n),
    );
    proto = Object.getPrototypeOf(proto);
  }
  return Array.from(names);
};

const toEventName = (h: string): string => {
  const c = h.replace(/^(onWindow|onWebContents|on)/, "");
  return c
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
};

const attachHandlersToEmitter = (
  emitter: TEventEmitter,
  win: BrowserWindow,
  inst: TWindowManagerWithHandlers,
  names: string[],
  filter: (n: string) => boolean,
): Array<() => void> => {
  const cleanups: Array<() => void> = [];
  for (const name of names) {
    if (!filter(name)) continue;
    const h = inst[name as keyof TWindowManagerWithHandlers];
    if (typeof h !== "function") continue;
    const evt = toEventName(name);
    const listener = (...args: unknown[]) => {
      h.length <= 1 ? h.apply(inst, [win]) : h.apply(inst, [...args, win]);
    };
    (emitter.on as any)(evt, listener);
    cleanups.push(() => {
      emitter.off
        ? (emitter.off as any)(evt, listener)
        : emitter.removeListener &&
          (emitter.removeListener as any)(evt, listener);
    });
  }
  return cleanups;
};

export const attachWindowEventListeners = (
  win: BrowserWindow,
  inst: TWindowManagerWithHandlers,
): void => {
  const entry = windowListeners.get(win);
  if (entry?.instance === inst) return;
  if (entry) entry.cleanup.forEach((c) => c());

  const names = getPrototypeMethodNames(inst).filter((n) => n.startsWith("on"));
  const isWebContents = (n: string) => n.startsWith("onWebContents");

  const winCleanups = attachHandlersToEmitter(
    win,
    win,
    inst,
    names,
    (n) => !isWebContents(n),
  );
  const webCleanups = attachHandlersToEmitter(
    win.webContents,
    win,
    inst,
    names,
    isWebContents,
  );

  windowListeners.set(win, {
    instance: inst,
    cleanup: [...winCleanups, ...webCleanups],
  });

  win.once("closed", () => {
    const e = windowListeners.get(win);
    if (e) {
      e.cleanup.forEach((c) => c());
      windowListeners.delete(win);
    }
  });
};
