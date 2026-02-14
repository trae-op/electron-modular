/**
 * @fileoverview Module import registration.
 *
 * Handles recursive initialization of imported modules to establish
 * the dependency graph. Imported modules are initialized before the
 * importing module can access their exported providers.
 *
 * @module @core/bootstrap/register-imports
 */

import type { RgModuleMetadata } from "../types/module-metadata.js";
import type { Constructor } from "../types/constructor.js";
import { EagerModuleCannotImportLazyModuleError } from "../errors/index.js";
import { initializeModule } from "./initialize-module.js";

/**
 * Recursively initializes all modules imported by the current module.
 *
 * This ensures that all imported modules are fully initialized before
 * the importing module tries to resolve their exported providers.
 *
 * @param metadata - Module metadata containing imports array
 */
export const registerImports = async (
  moduleClass: Constructor,
  metadata: RgModuleMetadata,
): Promise<void> => {
  if (!metadata.imports) {
    return;
  }

  for (const importedModuleClass of metadata.imports) {
    const importedModuleMetadata = Reflect.getMetadata(
      "RgModule",
      importedModuleClass,
    ) as RgModuleMetadata | undefined;

    if (importedModuleMetadata?.lazy?.enabled && !metadata.lazy?.enabled) {
      throw new EagerModuleCannotImportLazyModuleError(
        moduleClass.name,
        importedModuleClass.name,
      );
    }

    if (importedModuleMetadata) {
      await initializeModule(importedModuleClass, importedModuleMetadata);
    }
  }
};
