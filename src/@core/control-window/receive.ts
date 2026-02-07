/**
 * @fileoverview Window retrieval utility.
 *
 * Provides functionality to retrieve cached BrowserWindow instances by their hash.
 *
 * @module @core/control-window/receive
 */

import type { BrowserWindow } from "electron";
import { cacheWindows } from "./cache.js";

/**
 * Retrieves a cached BrowserWindow by its hash.
 *
 * Returns undefined if:
 * - Window is not cached
 * - Window has been destroyed
 * - Hash does not exist in cache
 *
 * @param name - Window hash identifier
 * @returns BrowserWindow instance or undefined
 *
 * @example
 * ```typescript
 * const mainWindow = getWindow('window:main');
 * if (mainWindow) {
 *   mainWindow.show();
 * }
 * ```
 */
export const getWindow = <N extends string>(
  name: N,
): BrowserWindow | undefined => {
  const win = cacheWindows.get(name);

  if (!win || typeof win === "boolean" || win.isDestroyed()) {
    return undefined;
  }

  return win;
};
