/**
 * @fileoverview IPC handler registration.
 *
 * Registers all IPC handler classes as providers in the container.
 * The handlers are instantiated later during initialization when their
 * dependencies can be resolved.
 *
 * @module @core/bootstrap/register-ipc-handlers
 */

import type { Constructor } from "../types/constructor.js";
import type { RgModuleMetadata } from "../types/module-metadata.js";
import { container } from "../container.js";

/**
 * Registers all IPC handler classes defined in a module.
 *
 * Each IPC handler is registered as a provider using the class as the token.
 * The actual instantiation and onInit call happens later in the bootstrap process.
 *
 * @param moduleClass - The module class owning these IPC handlers
 * @param metadata - Module metadata containing ipc array
 */
export const registerIpcHandlers = async (
  moduleClass: Constructor,
  metadata: RgModuleMetadata,
): Promise<void> => {
  if (!metadata.ipc) {
    return;
  }

  for (const ipcClass of metadata.ipc) {
    container.addProvider(moduleClass, ipcClass);
  }
};
