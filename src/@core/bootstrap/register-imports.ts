import type { RgModuleMetadata } from "../types/module-metadata.js";
import { initializeModule } from "./initialize-module.js";

export const registerImports = async (
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

    if (importedModuleMetadata) {
      await initializeModule(importedModuleClass, importedModuleMetadata);
    }
  }
};
