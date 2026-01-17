import type { Constructor } from "../types/constructor.js";
import type { RgModuleMetadata } from "../types/module-metadata.js";
import { InvalidProviderError } from "../errors/index.js";
import { container } from "../container.js";

const isProviderObject = (
  provider: unknown,
): provider is { provide: unknown } => {
  return (
    typeof provider === "object" && provider !== null && "provide" in provider
  );
};

export const registerProviders = async (
  moduleClass: Constructor,
  metadata: RgModuleMetadata,
): Promise<void> => {
  if (!metadata.providers) {
    return;
  }

  for (const provider of metadata.providers) {
    if (typeof provider === "function") {
      container.addProvider(moduleClass, provider);
      continue;
    }

    if (isProviderObject(provider)) {
      container.addProvider(moduleClass, provider.provide, provider);
      continue;
    }

    throw new InvalidProviderError(moduleClass.name);
  }
};
