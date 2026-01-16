import { BrowserWindow } from "electron";
import { container } from "../../container.js";
import type { TIpcHandlerInterface } from "../../types/ipc-handler.js";
import type { RgModuleMetadata } from "../../types/module-metadata.js";
import type { TWindowFactory } from "../../types/window-factory.js";
import type { Constructor } from "../../types/constructor.js";
import { createWindowWithParams } from "./window-creator.js";
import { createWindowInstance } from "./window-instance-creator.js";
import { attachWindowEventListeners } from "./window-event-listeners.js";
import type { TParamsCreateWindow } from "../../control-window/types.js";
import type { TMetadataWindow } from "../../types/window-metadata.js";

export async function initializeIpcHandlers(
  moduleClass: Constructor,
  metadata: RgModuleMetadata
): Promise<void> {
  if (metadata.ipc) {
    for (const ipcClass of metadata.ipc) {
      const ipcInstance = (await container.resolve(
        moduleClass,
        ipcClass
      )) as TIpcHandlerInterface;
      if (ipcInstance && typeof ipcInstance.onInit === "function") {
        ipcInstance.onInit({
          getWindow: (name?: string): TWindowFactory => {
            if (!name) {
              return {
                create: async (): Promise<BrowserWindow | undefined> =>
                  undefined,
              };
            }

            const windowMetadata = container.getProvider<TMetadataWindow>(
              moduleClass,
              name
            );

            return {
              create: async (
                params?: TParamsCreateWindow
              ): Promise<BrowserWindow | undefined> => {
                if (
                  windowMetadata?.metadata?.options &&
                  windowMetadata?.metadata?.hash &&
                  windowMetadata.windowClass
                ) {
                  const browserWindow = createWindowWithParams(
                    windowMetadata.metadata,
                    params
                  );
                  const windowInstance = await createWindowInstance(
                    moduleClass,
                    windowMetadata.windowClass
                  );

                  if (browserWindow && windowInstance) {
                    attachWindowEventListeners(browserWindow, windowInstance);
                    return browserWindow;
                  }
                }
                return undefined;
              },
            };
          },
        });
      }
    }
  }
}
