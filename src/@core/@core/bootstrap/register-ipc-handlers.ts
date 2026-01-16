import { container } from "../container.js";
import { Constructor } from "../types/constructor.js";
import { RgModuleMetadata } from "../types/module-metadata.js";

export async function registerIpcHandlers(
  moduleClass: Constructor,
  metadata: RgModuleMetadata
): Promise<void> {
  if (metadata.ipc) {
    for (const ipcClass of metadata.ipc) {
      container.addProvider(moduleClass, ipcClass);
    }
  }
}
