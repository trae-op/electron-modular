import { container } from "../container.js";
import { Constructor } from "../types/constructor.js";
import { RgModuleMetadata } from "../types/module-metadata.js";
import { WindowManagerOptions } from "../types/window-manager.js";

export async function registerWindows(
  moduleClass: Constructor,
  metadata: RgModuleMetadata
): Promise<void> {
  if (metadata.windows) {
    for (const windowClass of metadata.windows) {
      const windowMetadataValue: WindowManagerOptions | undefined =
        Reflect.getMetadata("WindowManager", windowClass);
      if (windowMetadataValue?.hash) {
        container.addProvider(moduleClass, windowMetadataValue.hash, {
          metadata: windowMetadataValue,
          windowClass,
        });
      }
    }
  }
}
