/**
 * @fileoverview Provider registration logic.
 *
 * Handles registration of all provider types:
 * - Class providers (simple constructors)
 * - Factory providers (useFactory)
 * - Value providers (useValue)
 * - Class providers with custom tokens (useClass)
 * - Existing providers (useExisting)
 *
 * @module @core/bootstrap/register-providers
 */

import type { Constructor } from "../types/constructor.js";
import type { RgModuleMetadata } from "../types/module-metadata.js";
import { InvalidProviderError } from "../errors/index.js";
import { container } from "../container.js";

/**
 * Type guard to check if a provider is a provider object (not a simple class).
 *
 * @param provider - Provider to check
 * @returns true if provider is an object with a 'provide' property
 */
const isProviderObject = (
  provider: unknown,
): provider is { provide: unknown } => {
  return (
    typeof provider === "object" && provider !== null && "provide" in provider
  );
};

/**
 * Registers all providers defined in a module's metadata.
 *
 * Handles two provider formats:
 * 1. Simple class constructors - registered with the class as the token
 * 2. Provider objects - registered with custom token and configuration
 *
 * @param moduleClass - The module class owning these providers
 * @param metadata - Module metadata containing providers array
 * @throws {InvalidProviderError} If a provider is neither a function nor a valid provider object
 */
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
