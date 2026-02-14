/**
 * @fileoverview IPC handler initialization with window factory functions.
 *
 * Creates window factory functions and initializes IPC handlers by calling their onInit methods.
 * Each IPC handler receives a getWindow function that returns window factories keyed by hash.
 *
 * @module @core/bootstrap/initialize-ipc/handlers
 */

import type { BrowserWindow } from "electron";
import type { Constructor } from "../../types/constructor.js";
import type { TIpcHandlerInterface } from "../../types/ipc-handler.js";
import type { RgModuleMetadata } from "../../types/module-metadata.js";
import type { TWindowFactory } from "../../types/window-factory.js";
import type { TParamsCreateWindow } from "../../control-window/types.js";
import type { TMetadataWindow } from "../../types/window-metadata.js";
import { container } from "../../container.js";
import { createWindowWithParams } from "./window-creator.js";
import { createWindowInstance } from "./window-instance-creator.js";
import { attachWindowEventListeners } from "./window-event-listeners.js";

/**
 * Creates a window factory that can instantiate BrowserWindows.
 *
 * @param moduleClass - The module context
 * @param windowMetadata - Window metadata including options and hash
 * @returns Window factory with create method
 */
const createWindowFactory = (
  moduleClass: Constructor,
  windowMetadata: TMetadataWindow | undefined,
): TWindowFactory => {
  if (
    !windowMetadata?.metadata?.options ||
    !windowMetadata.metadata.hash ||
    !windowMetadata.windowClass
  ) {
    return {
      create: async () => undefined,
    };
  }

  return {
    create: async (
      params?: TParamsCreateWindow,
    ): Promise<BrowserWindow | undefined> => {
      const browserWindow = createWindowWithParams(
        windowMetadata.metadata,
        params,
      );
      const windowInstance = await createWindowInstance(
        moduleClass,
        windowMetadata.windowClass,
      );

      if (browserWindow && windowInstance) {
        attachWindowEventListeners(browserWindow, windowInstance);
        return browserWindow;
      }

      return undefined;
    },
  };
};

/**
 * Creates a getWindow function for retrieving window factories by hash.
 *
 * @param moduleClass - The module context
 * @returns Function that returns window factories by hash
 */
const createGetWindowFunction = (moduleClass: Constructor) => {
  return (name?: string): TWindowFactory => {
    if (!name) {
      return {
        create: async () => undefined,
      };
    }

    const windowMetadata = container.getProvider<TMetadataWindow>(
      moduleClass,
      name,
    );

    return createWindowFactory(moduleClass, windowMetadata);
  };
};

/**
 * Initializes all IPC handlers for a module.
 *
 * Process:
 * 1. Creates a getWindow function for the module
 * 2. Resolves each IPC handler instance from the container
 * 3. Calls onInit on each handler with the getWindow function
 *
 * This allows IPC handlers to access window factories and create windows dynamically.
 *
 * @param moduleClass - The module class owning these IPC handlers
 * @param metadata - Module metadata containing ipc array
 */
export const initializeIpcHandlers = async (
  moduleClass: Constructor,
  metadata: RgModuleMetadata,
): Promise<void> => {
  if (!metadata.ipc) {
    return;
  }

  const getWindow = createGetWindowFunction(moduleClass);

  for (const ipcClass of metadata.ipc) {
    const ipcInstance = await container.resolve<TIpcHandlerInterface>(
      moduleClass,
      ipcClass,
    );

    if (ipcInstance?.onInit) {
      await ipcInstance.onInit({ getWindow });
    }
  }
};
