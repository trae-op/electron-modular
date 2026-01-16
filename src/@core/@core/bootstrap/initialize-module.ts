import { container } from "../container.js";
import { RgModuleMetadata } from "../types/module-metadata.js";
import { registerProviders } from "./register-providers.js";
import { registerImports } from "./register-imports.js";
import { registerWindows } from "./register-windows.js";
import { registerIpcHandlers } from "./register-ipc-handlers.js";
import { Constructor } from "../types/constructor.js";

export async function initializeModule(
  moduleClass: Constructor,
  metadata: RgModuleMetadata
): Promise<void> {
  const isNewModule = container.addModule(moduleClass, metadata);
  container.setModuleMetadata(moduleClass, metadata);

  if (!isNewModule) {
    return;
  }
  await registerProviders(moduleClass, metadata);
  await registerImports(metadata);
  await registerWindows(moduleClass, metadata);
  await registerIpcHandlers(moduleClass, metadata);
}
