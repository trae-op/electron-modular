/**
 * @fileoverview Lazy module registration for deferred initialization.
 *
 * Registers an ipcMain.handle() listener for lazy modules that triggers
 * full module initialization on first IPC invocation. After initialization,
 * the module behaves identically to an eager-loaded module.
 *
 * @module @core/bootstrap/register-lazy-module
 */

import { ipcMain } from "electron";
import type { RgModuleMetadata } from "../types/module-metadata.js";
import type { Constructor } from "../types/constructor.js";
import type { TLazyModuleResponse } from "../types/lazy.js";
import { initializeModule } from "./initialize-module.js";
import { instantiateModule } from "./instantiate-module.js";
import { container } from "../container.js";
import { initializeIpcHandlers } from "./initialize-ipc/handlers.js";
import { InvalidLazyTriggerError } from "../errors/index.js";

const getValidLazyTrigger = (
  moduleClass: Constructor,
  metadata: RgModuleMetadata,
): string => {
  const trigger = metadata.lazy?.trigger;

  if (typeof trigger !== "string" || trigger.trim().length === 0) {
    throw new InvalidLazyTriggerError(moduleClass.name);
  }

  return trigger.trim();
};

/**
 * Registers a lazy module by setting up an IPC handler for deferred initialization.
 *
 * Instead of initializing the module immediately, this function registers
 * an ipcMain.handle() listener using the trigger from lazy config.
 * When the IPC channel is invoked from a renderer process, the module
 * is fully initialized using the same logic as eager-loaded modules.
 *
 * Handles concurrent invocations by reusing the same initialization promise,
 * ensuring the module is only initialized once.
 *
 * @param moduleClass - The module class constructor
 * @param metadata - Module metadata from @RgModule decorator
 */
export const registerLazyModule = (
  moduleClass: Constructor,
  metadata: RgModuleMetadata,
): void => {
  const trigger = getValidLazyTrigger(moduleClass, metadata);
  let initPromise: Promise<TLazyModuleResponse> | null = null;

  ipcMain.handle(trigger, async (): Promise<TLazyModuleResponse> => {
    if (initPromise) {
      return initPromise;
    }

    initPromise = (async (): Promise<TLazyModuleResponse> => {
      try {
        await initializeModule(moduleClass, metadata);
        await instantiateModule(moduleClass);
        await container.resolve(moduleClass, moduleClass);

        if (metadata.windows?.length && !metadata.ipc?.length) {
          console.warn(
            `Warning: Window(s) declared in module "${moduleClass.name}" but no IPC handlers found to manage them.`,
          );
        }

        await initializeIpcHandlers(moduleClass, metadata);

        return {
          initialized: true,
          name: trigger,
        };
      } catch (error) {
        initPromise = null;

        return {
          initialized: false,
          name: trigger,
          error: {
            message: error instanceof Error ? error.message : String(error),
          },
        };
      }
    })();

    return initPromise;
  });
};
