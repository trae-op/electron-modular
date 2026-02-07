/**
 * @fileoverview Window destruction utility.
 *
 * Provides functionality to destroy all BrowserWindows in the application.
 * Useful for cleanup during app shutdown or testing.
 *
 * @module @core/control-window/destroy
 */

import { BrowserWindow } from "electron";

/**
 * Destroys all existing BrowserWindow instances.
 *
 * Iterates through all windows and destroys them if not already destroyed.
 * This clears all cached windows and frees resources.
 *
 * Typically called during app shutdown:
 * ```typescript
 * app.on('before-quit', () => {
 *   destroyWindows();
 * });
 * ```
 */
export const destroyWindows = (): void => {
  const windows = BrowserWindow.getAllWindows();

  for (const window of windows) {
    if (!window.isDestroyed()) {
      window.destroy();
    }
  }
};
