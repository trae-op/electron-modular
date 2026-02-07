/**
 * @fileoverview Module initialization coordinator.
 *
 * Orchestrates the registration of all module components:
 * - Providers (services and factories)
 * - Imported modules
 * - Window managers
 * - IPC handlers
 *
 * @module @core/bootstrap/initialize-module
 */

import type { RgModuleMetadata } from "../types/module-metadata.js";
import type { Constructor } from "../types/constructor.js";
import { container } from "../container.js";
import { registerProviders } from "./register-providers.js";
import { registerImports } from "./register-imports.js";
import { registerWindows } from "./register-windows.js";
import { registerIpcHandlers } from "./register-ipc-handlers.js";

/**
 * Initializes a module by registering all its components in the container.
 *
 * Process:
 * 1. Adds module to container with metadata
 * 2. Registers all providers
 * 3. Recursively initializes imported modules
 * 4. Registers window managers
 * 5. Registers IPC handlers
 *
 * All registration steps run in parallel for performance.
 *
 * @param moduleClass - The module class constructor
 * @param metadata - Module metadata from @RgModule decorator
 */
export const initializeModule = async (
  moduleClass: Constructor,
  metadata: RgModuleMetadata,
): Promise<void> => {
  const isNewModule = container.addModule(moduleClass, metadata);
  container.setModuleMetadata(moduleClass, metadata);

  if (!isNewModule) {
    return;
  }

  await Promise.all([
    registerProviders(moduleClass, metadata),
    registerImports(metadata),
    registerWindows(moduleClass, metadata),
    registerIpcHandlers(moduleClass, metadata),
  ]);
};
