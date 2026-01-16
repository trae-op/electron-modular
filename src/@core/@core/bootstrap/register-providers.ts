import { container } from "../container.js";
import { Constructor } from "../types/constructor.js";
import { RgModuleMetadata } from "../types/module-metadata.js";

export async function registerProviders(
  moduleClass: Constructor,
  metadata: RgModuleMetadata
): Promise<void> {
  if (metadata.providers) {
    for (const provider of metadata.providers) {
      if (typeof provider === "function") {
        container.addProvider(moduleClass, provider);
        continue;
      }

      if (
        typeof provider === "object" &&
        provider !== null &&
        "provide" in provider
      ) {
        container.addProvider(moduleClass, provider.provide, provider);
        continue;
      }

      throw new Error(
        `Invalid provider definition registered in module ${moduleClass.name}`
      );
    }
  }
}
