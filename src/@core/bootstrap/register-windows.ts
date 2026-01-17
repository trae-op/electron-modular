import type { Constructor } from "../types/constructor.js";
import type { RgModuleMetadata } from "../types/module-metadata.js";
import type { WindowManagerOptions } from "../types/window-manager.js";
import { container } from "../container.js";

export const registerWindows = async (
  moduleClass: Constructor,
  metadata: RgModuleMetadata,
): Promise<void> => {
  if (!metadata.windows) {
    return;
  }

  for (const windowClass of metadata.windows) {
    const windowMetadataValue = Reflect.getMetadata(
      "WindowManager",
      windowClass,
    ) as WindowManagerOptions | undefined;

    if (windowMetadataValue?.hash) {
      container.addProvider(moduleClass, windowMetadataValue.hash, {
        metadata: windowMetadataValue,
        windowClass,
      });
    }
  }
};
