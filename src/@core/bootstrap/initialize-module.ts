import type { RgModuleMetadata } from "../types/module-metadata.js";
import type { Constructor } from "../types/constructor.js";
import { container } from "../container.js";
import { registerProviders } from "./register-providers.js";
import { registerImports } from "./register-imports.js";
import { registerWindows } from "./register-windows.js";
import { registerIpcHandlers } from "./register-ipc-handlers.js";

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
