import { BrowserWindow } from "electron";
import type { TWindowManagerWithHandlers } from "../../types/window-manager.js";

type TEventEmitter = {
  on: (...args: any[]) => any;
  off?: (...args: any[]) => any;
  removeListener?: (...args: any[]) => any;
};

type TWindowListenerEntry = {
  instance: TWindowManagerWithHandlers;
  cleanup: Array<() => void>;
};

const windowListeners = new WeakMap<BrowserWindow, TWindowListenerEntry>();

const EVENT_PREFIX = "on" as const;
const WINDOW_PREFIX = "onWindow" as const;
const WEB_CONTENTS_PREFIX = "onWebContents" as const;

const getPrototypeMethodNames = (instance: object): string[] => {
  const names = new Set<string>();
  let proto = Object.getPrototypeOf(instance);

  while (proto && proto !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name !== "constructor") {
        names.add(name);
      }
    }
    proto = Object.getPrototypeOf(proto);
  }

  return Array.from(names);
};

const toEventName = (handlerName: string): string => {
  const cleaned = handlerName
    .replace(WINDOW_PREFIX, "")
    .replace(WEB_CONTENTS_PREFIX, "")
    .replace(EVENT_PREFIX, "");

  const kebab = cleaned
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();

  return kebab;
};

const isHandlerName = (name: string): boolean => {
  return name.startsWith(EVENT_PREFIX);
};

const isWebContentsHandler = (name: string): boolean => {
  return name.startsWith(WEB_CONTENTS_PREFIX);
};

const isWindowHandler = (name: string): boolean => {
  return name.startsWith(WINDOW_PREFIX);
};

const addListener = (
  emitter: TEventEmitter,
  eventName: string,
  listener: (...args: any[]) => void
): (() => void) => {
  emitter.on(eventName, listener);

  return () => {
    if (typeof emitter.off === "function") {
      emitter.off(eventName, listener);
      return;
    }

    if (typeof emitter.removeListener === "function") {
      emitter.removeListener(eventName, listener);
    }
  };
};

const attachHandlersToEmitter = (
  emitter: TEventEmitter,
  browserWindow: BrowserWindow,
  windowInstance: TWindowManagerWithHandlers,
  handlerNames: string[],
  filter: (name: string) => boolean
): Array<() => void> => {
  const cleanups: Array<() => void> = [];

  for (const handlerName of handlerNames) {
    if (!filter(handlerName)) {
      continue;
    }

    const handler =
      windowInstance[handlerName as keyof TWindowManagerWithHandlers];
    if (typeof handler !== "function") {
      continue;
    }

    const eventName = toEventName(handlerName);
    const listener = (...args: any[]) => {
      if (handler.length <= 1) {
        handler.apply(windowInstance, [browserWindow]);
        return;
      }

      handler.apply(windowInstance, [...args, browserWindow]);
    };

    cleanups.push(addListener(emitter, eventName, listener));
  }

  return cleanups;
};

export function attachWindowEventListeners(
  browserWindow: BrowserWindow,
  windowInstance: TWindowManagerWithHandlers
): void {
  const entry = windowListeners.get(browserWindow);

  if (entry && entry.instance === windowInstance) {
    return;
  }

  if (entry) {
    entry.cleanup.forEach((cleanup) => cleanup());
  }

  const handlerNames =
    getPrototypeMethodNames(windowInstance).filter(isHandlerName);

  const windowCleanups = attachHandlersToEmitter(
    browserWindow,
    browserWindow,
    windowInstance,
    handlerNames,
    (name) => !isWebContentsHandler(name)
  );

  const webContentsCleanups = attachHandlersToEmitter(
    browserWindow.webContents,
    browserWindow,
    windowInstance,
    handlerNames,
    (name) => isWebContentsHandler(name)
  );

  windowListeners.set(browserWindow, {
    instance: windowInstance,
    cleanup: [...windowCleanups, ...webContentsCleanups],
  });

  browserWindow.once("closed", () => {
    const existing = windowListeners.get(browserWindow);
    if (existing) {
      existing.cleanup.forEach((cleanup) => cleanup());
      windowListeners.delete(browserWindow);
    }
  });
}
