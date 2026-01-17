import type { RgModuleMetadata } from "../types/module-metadata.js";
import type { Constructor } from "../types/constructor.js";
import { ModuleDecoratorMissingError } from "../errors/index.js";
import { instantiateModule } from "./instantiate-module.js";
import { initializeModule } from "./initialize-module.js";
import { container } from "../container.js";
import { initializeIpcHandlers } from "./initialize-ipc/handlers.js";

export const bootstrapModules = async (
  modulesClass: Constructor[],
): Promise<void> => {
  for (const moduleClass of modulesClass) {
    const metadata = Reflect.getMetadata("RgModule", moduleClass) as
      | RgModuleMetadata
      | undefined;

    if (!metadata) {
      throw new ModuleDecoratorMissingError(moduleClass.name);
    }

    await initializeModule(moduleClass, metadata);
    await instantiateModule(moduleClass);
    await container.resolve(moduleClass, moduleClass);

    if (metadata.windows?.length && !metadata.ipc?.length) {
      console.warn(
        `Warning: Window(s) declared in module "${moduleClass.name}" but no IPC handlers found to manage them.`,
      );
    }

    await initializeIpcHandlers(moduleClass, metadata);
  }
};
