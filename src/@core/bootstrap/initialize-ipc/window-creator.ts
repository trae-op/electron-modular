/**
 * @fileoverview Window creation with parameter merging.
 *
 * Handles merging of base window metadata with runtime parameters to create BrowserWindows.
 * Supports deep merging of nested configuration objects.
 *
 * @module @core/bootstrap/initialize-ipc/window-creator
 */

import type { BrowserWindow } from "electron";
import type { TParamsCreateWindow } from "../../control-window/types.js";
import { createWindow } from "../../control-window/create.js";

/** Plain JavaScript object type */
type TPlainObject = Record<string, unknown>;

/**
 * Type guard to check if a value is a plain object.
 *
 * @param value - Value to check
 * @returns true if value is a plain object
 */
const isPlainObject = (value: unknown): value is TPlainObject => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
};

/**
 * Deep merges two objects recursively.
 *
 * Plain objects are merged recursively, other values from source override target.
 *
 * @param target - Target object
 * @param source - Source object with values to merge
 * @returns Merged object
 */
const mergeDeep = <T extends TPlainObject>(target: T, source: T): T => {
  const output: TPlainObject = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value)) {
      const current = output[key];
      output[key] = isPlainObject(current)
        ? mergeDeep(current, value)
        : mergeDeep({}, value);
    } else {
      output[key] = value;
    }
  }

  return output as T;
};

/**
 * Creates a BrowserWindow with merged metadata and runtime parameters.
 *
 * Base metadata from @WindowManager is deep merged with optional runtime params.
 * This allows dynamic window configuration while maintaining sensible defaults.
 *
 * @param baseMetadata - Base window metadata from decorator
 * @param params - Optional runtime parameters to merge
 * @returns Created BrowserWindow instance
 *
 * @example
 * ```typescript
 * const window = createWindowWithParams(
 *   { hash: 'window:main', options: { width: 800 } },
 *   { options: { height: 600 } }
 * );
 * ```
 */
export const createWindowWithParams = <W extends TParamsCreateWindow>(
  baseMetadata: W,
  params?: W,
): BrowserWindow => {
  const mergedSettings =
    params !== undefined
      ? mergeDeep(baseMetadata as TPlainObject, params as TPlainObject)
      : baseMetadata;

  return createWindow(mergedSettings);
};
