/**
 * @fileoverview Window factory type definitions.
 *
 * Defines types for window creation factories provided to IPC handlers.
 *
 * @module @core/types/window-factory
 */

import { BrowserWindow } from "electron";
import type { TParamsCreateWindow } from "../control-window/types.js";

/**
 * Function type for creating BrowserWindow instances.
 *
 * @param options - Optional parameters to customize window creation
 * @returns Promise resolving to BrowserWindow or undefined
 */
export type TWindowCreate = (
  options?: TParamsCreateWindow,
) => Promise<BrowserWindow | undefined>;

/**
 * Window factory interface provided to IPC handlers.
 *
 * Allows IPC handlers to create windows dynamically with optional parameters.
 */
export type TWindowFactory = {
  create: TWindowCreate;
};
