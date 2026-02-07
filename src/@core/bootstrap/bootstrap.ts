/**
 * @fileoverview Bootstrap entry point for initializing all application modules.
 *
 * This file orchestrates the module initialization process:
 * 1. Validates that modules have the @RgModule decorator
 * 2. Initializes each module (registers providers, imports, windows, IPC handlers)
 * 3. Instantiates the module class
 * 4. Resolves module dependencies
 * 5. Initializes IPC handlers with window factory functions
 *
 * @module @core/bootstrap/bootstrap
 */

import type { RgModuleMetadata } from "../types/module-metadata.js";
import type { Constructor } from "../types/constructor.js";
import { ModuleDecoratorMissingError } from "../errors/index.js";
import { instantiateModule } from "./instantiate-module.js";
import { initializeModule } from "./initialize-module.js";
import { container } from "../container.js";
import { initializeIpcHandlers } from "./initialize-ipc/handlers.js";

/**
 * Bootstraps an array of modules in the application.
 *
 * This is the main entry point for initializing the dependency injection container
 * and setting up all modules. It processes each module sequentially to ensure
 * proper dependency resolution order.
 *
 * @param modulesClass - Array of module class constructors to bootstrap
 * @throws {ModuleDecoratorMissingError} If a module is missing the @RgModule decorator
 *
 * @example
 * ```typescript
 * await bootstrapModules([
 *   UserModule,
 *   ResourcesModule,
 *   AuthModule
 * ]);
 * ```
 */
export const bootstrapModules = async (
  modulesClass: Constructor[],
): Promise<void> => {
  for (const moduleClass of modulesClass) {
    const metadata = Reflect.getMetadata("RgModule", moduleClass) as
      | RgModuleMetadata
      | undefined;

    if (!metadata) {
      throw new ModuleDecoratorMissingError(moduleClass.name);
    }

    await initializeModule(moduleClass, metadata);
    await instantiateModule(moduleClass);
    await container.resolve(moduleClass, moduleClass);

    if (metadata.windows?.length && !metadata.ipc?.length) {
      console.warn(
        `Warning: Window(s) declared in module "${moduleClass.name}" but no IPC handlers found to manage them.`,
      );
    }

    await initializeIpcHandlers(moduleClass, metadata);
  }
};
