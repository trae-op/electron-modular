import { RgModuleMetadata } from "../types/module-metadata.js";
import { initializeModule } from "./initialize-module.js";

export async function registerImports(
  metadata: RgModuleMetadata
): Promise<void> {
  if (metadata.imports) {
    for (const importedModuleClass of metadata.imports) {
      const importedModuleMetadata: RgModuleMetadata | undefined =
        Reflect.getMetadata("RgModule", importedModuleClass);
      if (importedModuleMetadata) {
        await initializeModule(importedModuleClass, importedModuleMetadata);
      }
    }
  }
}
