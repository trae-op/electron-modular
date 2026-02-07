/**
 * @fileoverview Configuration defaults for build output folders.
 *
 * Defines the default folder structure for Electron application build outputs.
 * These defaults can be overridden using the `initSettings` function.
 *
 * @module config
 */

/**
 * Default folder configuration for build outputs.
 *
 * @property {string} distRenderer - Default folder for renderer process build output
 * @property {string} distMain - Default folder for main process build output
 */
export const folders = {
  distRenderer: "dist-renderer",
  distMain: "dist-main",
};
