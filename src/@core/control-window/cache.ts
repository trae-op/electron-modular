/**
 * @fileoverview Window cache storage.
 *
 * Maintains a global Map of cached BrowserWindow instances keyed by their hash.
 * Cached windows are hidden instead of destroyed when closed, allowing for fast re-opening.
 *
 * @module @core/control-window/cache
 */

import type { TCache } from "./types.js";

/**
 * Global cache for BrowserWindow instances.
 *
 * Windows with isCache=true are stored here and hidden on close instead of destroyed.
 * This improves performance when reopening frequently used windows.
 */
export const cacheWindows = new Map<keyof TCache, TCache[keyof TCache]>();
