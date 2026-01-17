import type { BrowserWindow } from "electron";
import type { Constructor } from "../../types/constructor.js";
import type { TIpcHandlerInterface } from "../../types/ipc-handler.js";
import type { RgModuleMetadata } from "../../types/module-metadata.js";
import type { TWindowFactory } from "../../types/window-factory.js";
import type { TParamsCreateWindow } from "../../control-window/types.js";
import type { TMetadataWindow } from "../../types/window-metadata.js";
import { container } from "../../container.js";
import { createWindowWithParams } from "./window-creator.js";
import { createWindowInstance } from "./window-instance-creator.js";
import { attachWindowEventListeners } from "./window-event-listeners.js";

const createWindowFactory = (
  moduleClass: Constructor,
  windowMetadata: TMetadataWindow | undefined,
): TWindowFactory => {
  if (
    !windowMetadata?.metadata?.options ||
    !windowMetadata.metadata.hash ||
    !windowMetadata.windowClass
  ) {
    return {
      create: async () => undefined,
    };
  }

  return {
    create: async (
      params?: TParamsCreateWindow,
    ): Promise<BrowserWindow | undefined> => {
      const browserWindow = createWindowWithParams(
        windowMetadata.metadata,
        params,
      );
      const windowInstance = await createWindowInstance(
        moduleClass,
        windowMetadata.windowClass,
      );

      if (browserWindow && windowInstance) {
        attachWindowEventListeners(browserWindow, windowInstance);
        return browserWindow;
      }

      return undefined;
    },
  };
};

const createGetWindowFunction = (moduleClass: Constructor) => {
  return (name?: string): TWindowFactory => {
    if (!name) {
      return {
        create: async () => undefined,
      };
    }

    const windowMetadata = container.getProvider<TMetadataWindow>(
      moduleClass,
      name,
    );

    return createWindowFactory(moduleClass, windowMetadata);
  };
};

export const initializeIpcHandlers = async (
  moduleClass: Constructor,
  metadata: RgModuleMetadata,
): Promise<void> => {
  if (!metadata.ipc) {
    return;
  }

  const getWindow = createGetWindowFunction(moduleClass);

  for (const ipcClass of metadata.ipc) {
    const ipcInstance = await container.resolve<TIpcHandlerInterface>(
      moduleClass,
      ipcClass,
    );

    if (ipcInstance?.onInit) {
      ipcInstance.onInit({ getWindow });
    }
  }
};
