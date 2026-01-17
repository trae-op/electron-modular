import type { Constructor } from "../types/constructor.js";
import type { RgModuleMetadata } from "../types/module-metadata.js";
import { container } from "../container.js";

export const registerIpcHandlers = async (
  moduleClass: Constructor,
  metadata: RgModuleMetadata,
): Promise<void> => {
  if (!metadata.ipc) {
    return;
  }

  for (const ipcClass of metadata.ipc) {
    container.addProvider(moduleClass, ipcClass);
  }
};
