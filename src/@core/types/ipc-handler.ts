/**
 * @fileoverview IPC handler interface definition.
 *
 * Defines the interface that IPC handler classes must implement.
 *
 * @module @core/types/ipc-handler
 */

import type { TWindowFactory } from "./window-factory.js";

/**
 * Parameters passed to IPC handler onInit method.
 *
 * @template N - String literal type for window hash
 * @property getWindow - Function to retrieve window factories by hash
 */
export type TParamOnInit<N = string> = {
  getWindow: (name?: N) => TWindowFactory;
};

/**
 * Interface that IPC handler classes must implement.
 *
 * IPC handlers are initialized during module bootstrap and receive
 * a getWindow function to access window factories.
 */
export type TIpcHandlerInterface = {
  onInit?: (data: TParamOnInit) => void | Promise<void>;
};
