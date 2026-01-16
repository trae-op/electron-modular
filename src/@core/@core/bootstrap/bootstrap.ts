import { RgModuleMetadata } from "../types/module-metadata.js";
import { instantiateModule } from "./instantiate-module.js";
import { initializeModule } from "./initialize-module.js";
import { container } from "../container.js";
import { initializeIpcHandlers } from "./initialize-ipc/handlers.js";
import { Constructor } from "../types/constructor.js";

export async function bootstrapModules(modulesClass: Constructor[]) {
  for (const moduleClass of modulesClass) {
    const metadata: RgModuleMetadata | undefined = Reflect.getMetadata(
      "RgModule",
      moduleClass
    );

    if (!metadata) {
      throw new Error(
        `Module ${moduleClass.name} does not have the @RgModule decorator`
      );
    }

    await initializeModule(moduleClass, metadata);
    await instantiateModule(moduleClass);
    await container.resolve(moduleClass, moduleClass);

    if (
      metadata.windows &&
      metadata.windows.length > 0 &&
      (!metadata.ipc || metadata.ipc.length === 0)
    ) {
      console.warn(
        `Warning: Window(s) declared in module "${moduleClass.name}" but no IPC handlers found to manage them.`
      );
    }

    await initializeIpcHandlers(moduleClass, metadata);
  }
}
