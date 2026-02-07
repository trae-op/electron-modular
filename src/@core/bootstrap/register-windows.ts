/**
 * @fileoverview Window manager registration.
 *
 * Registers window managers as providers with their hash as the token.
 * This allows IPC handlers to retrieve window factories using the hash string.
 *
 * @module @core/bootstrap/register-windows
 */

import type { Constructor } from "../types/constructor.js";
import type { RgModuleMetadata } from "../types/module-metadata.js";
import type { WindowManagerOptions } from "../types/window-manager.js";
import { container } from "../container.js";

/**
 * Registers all window managers defined in a module.
 *
 * Each window manager is registered with its hash as the provider token,
 * storing both the window metadata and the window class constructor.
 *
 * @param moduleClass - The module class owning these window managers
 * @param metadata - Module metadata containing windows array
 */
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
