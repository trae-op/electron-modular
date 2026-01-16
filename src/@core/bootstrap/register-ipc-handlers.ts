import { container } from "../container.js";
import type { Constructor } from "../types/constructor.js";
import type { RgModuleMetadata } from "../types/module-metadata.js";

export async function registerIpcHandlers(
  moduleClass: Constructor,
  metadata: RgModuleMetadata,
): Promise<void> {
  if (metadata.ipc) {
    for (const ipcClass of metadata.ipc) {
      container.addProvider(moduleClass, ipcClass);
    }
  }
}
