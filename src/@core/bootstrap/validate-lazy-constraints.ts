import type { Constructor } from "../types/constructor.js";
import type { RgModuleMetadata } from "../types/module-metadata.js";
import {
  LazyModuleCannotImportLazyModuleError,
  LazyModuleExportsNotAllowedError,
} from "../errors/index.js";

export const validateLazyConstraints = (
  moduleClass: Constructor,
  metadata: RgModuleMetadata,
): void => {
  if (!metadata.lazy?.enabled) {
    return;
  }

  if ((metadata.exports?.length ?? 0) > 0) {
    throw new LazyModuleExportsNotAllowedError(moduleClass.name);
  }

  if (!metadata.imports?.length) {
    return;
  }

  for (const importedModuleClass of metadata.imports) {
    const importedModuleMetadata = Reflect.getMetadata(
      "RgModule",
      importedModuleClass,
    ) as RgModuleMetadata | undefined;

    if (importedModuleMetadata?.lazy?.enabled) {
      throw new LazyModuleCannotImportLazyModuleError(
        moduleClass.name,
        importedModuleClass.name,
      );
    }
  }
};
