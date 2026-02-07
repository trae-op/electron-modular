/**
 * @fileoverview Type definitions for window creation and management.
 *
 * Defines types for:
 * - Window creation parameters
 * - Window caching
 * - Route parameters
 *
 * @module @core/control-window/types
 */

import { BrowserWindow, type BrowserWindowConstructorOptions } from "electron";

/**
 * Route parameters for dynamic window paths.
 */
export type TParamsRoute = {
  [key: string]: string;
};

/**
 * Parameters for creating a BrowserWindow.
 *
 * @template N - String literal type for the window hash
 */
export type TParamsCreateWindow<N = string> = {
  hash?: N;
  isCache?: boolean;
  paramsRoute?: TParamsRoute;
  options?: BrowserWindowConstructorOptions;
  loadURL?: string;
};

/**
 * Type for window cache mapping hashes to BrowserWindow instances.
 */
export type TCache = {
  [key in string]: BrowserWindow;
};
