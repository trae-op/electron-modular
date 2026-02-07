/**
 * @fileoverview @WindowManager decorator for defining BrowserWindow managers.
 *
 * The @WindowManager decorator:
 * - Defines window configuration (hash, caching, BrowserWindow options)
 * - Registers the class as a window factory provider
 * - Enables lifecycle hooks (onFocus, onWebContentsDidFinishLoad, etc.)
 *
 * @module @core/decorators/window-manager
 */

import "reflect-metadata/lite";
import type { TParamsCreateWindow } from "../control-window/types.js";

/**
 * Decorator that marks a class as a BrowserWindow manager.
 *
 * Window managers:
 * - Define window configuration and lifecycle
 * - Can implement lifecycle hooks as methods (onFocus, onClose, etc.)
 * - Are registered as providers keyed by their hash
 * - Can inject services for window initialization logic
 *
 * @param options - Window configuration including hash, caching, and BrowserWindow options
 * @returns ClassDecorator function
 *
 * @example
 * ```typescript
 * @WindowManager<TWindows['userProfile']>({
 *   hash: 'window:user-profile',
 *   isCache: true,
 *   options: {
 *     width: 600,
 *     height: 400,
 *     resizable: false
 *   }
 * })
 * export class UserWindow implements TWindowManager {
 *   onWebContentsDidFinishLoad(window: BrowserWindow): void {
 *     // Initialize when content loads
 *   }
 * }
 * ```
 */
export const WindowManager = <P extends string>(
  options: TParamsCreateWindow<P>,
): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata("WindowManager", options, target);
  };
};
