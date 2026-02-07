/**
 * @fileoverview Window lifecycle event listener attachment.
 *
 * Automatically attaches lifecycle hooks from window manager instances to BrowserWindow
 * and WebContents events. Supports:
 * - BrowserWindow events (onFocus, onClose, etc.)
 * - WebContents events (onWebContentsDidFinishLoad, etc.)
 *
 * Event handlers are named with 'on' prefix and CamelCase, which are converted to kebab-case event names.
 *
 * @module @core/bootstrap/initialize-ipc/window-event-listeners
 */

import type { BrowserWindow, WebContents } from "electron";
import type { TWindowManagerWithHandlers } from "../../types/window-manager.js";

/** Event emitter interface (BrowserWindow or WebContents) */
type TEventEmitter = Pick<
  BrowserWindow | WebContents,
  "on" | "off" | "removeListener"
>;

/** Tracks attached listeners and cleanup functions for each window */
type TWindowListenerEntry = {
  instance: TWindowManagerWithHandlers;
  cleanup: Array<() => void>;
};

/** WeakMap to track listeners per window instance */
const windowListeners = new WeakMap<BrowserWindow, TWindowListenerEntry>();

/**
 * Extracts all method names from an object's prototype chain.
 *
 * @param instance - Object to inspect
 * @returns Array of method names
 */
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

/**
 * Converts a method name to an Electron event name.
 *
 * Examples:
 * - onFocus -> focus
 * - onWebContentsDidFinishLoad -> did-finish-load
 * - onMaximize -> maximize
 *
 * @param h - Handler method name
 * @returns Kebab-case event name
 */
const toEventName = (h: string): string => {
  const c = h.replace(/^(onWindow|onWebContents|on)/, "");
  return c
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
};

/**
 * Attaches event handlers from window manager instance to an event emitter.
 *
 * Handlers with 0-1 parameters receive only the BrowserWindow instance.
 * Handlers with 2+ parameters receive original Electron event arguments plus the window.
 *
 * @param emitter - BrowserWindow or WebContents to attach listeners to
 * @param win - BrowserWindow instance to pass to handlers
 * @param inst - Window manager instance containing handler methods
 * @param names - Method names to consider
 * @param filter - Function to filter which methods to attach
 * @returns Array of cleanup functions to remove listeners
 */
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

/**
 * Attaches all lifecycle event listeners from a window manager to a BrowserWindow.
 *
 * Process:
 * 1. Checks if listeners are already attached to avoid duplicates
 * 2. Extracts all methods starting with 'on' from window manager
 * 3. Separates BrowserWindow events from WebContents events
 * 4. Attaches handlers to appropriate emitters
 * 5. Registers cleanup on window close
 *
 * @param win - BrowserWindow instance
 * @param inst - Window manager instance with lifecycle hooks
 *
 * @example
 * ```typescript
 * const window = new BrowserWindow();
 * const manager = new MyWindowManager();
 * attachWindowEventListeners(window, manager);
 * // Now manager.onFocus() will be called when window focuses
 * ```
 */
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
