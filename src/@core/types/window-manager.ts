/**
 * @fileoverview Window manager type definitions.
 *
 * Defines types for window manager configuration and lifecycle hooks.
 *
 * @module @core/types/window-manager
 */

import type { BrowserWindowConstructorOptions } from "electron";
import type { TParamsCreateWindow } from "../control-window/types.js";

/**
 * Window manager configuration options.
 *
 * Extends window creation parameters with required BrowserWindow options.
 */
export type WindowManagerOptions = TParamsCreateWindow & {
  options: BrowserWindowConstructorOptions;
};

/**
 * Generic window event handler function type.
 */
type TWindowEventHandler = (...args: any[]) => void;

/**
 * Type for window manager classes with lifecycle hook methods.
 *
 * Methods starting with 'on' are automatically attached as event listeners.
 * Examples: onFocus, onClose, onWebContentsDidFinishLoad
 */
export type TWindowManagerWithHandlers = {
  [key: `on${string}`]: TWindowEventHandler | undefined;
};
