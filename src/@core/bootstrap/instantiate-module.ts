/**
 * @fileoverview Module instantiation logic.
 *
 * Handles the creation of module instances with automatic dependency resolution.
 * Uses reflection to discover constructor dependencies and resolves them from the container.
 *
 * @module @core/bootstrap/instantiate-module
 */

import type { Constructor } from "../types/constructor.js";
import { container } from "../container.js";
import { getDependencyTokens } from "../utils/dependency-tokens.js";

/**
 * Instantiates a module class with its resolved dependencies.
 *
 * Process:
 * 1. Extracts constructor parameter types using reflection
 * 2. Resolves each dependency from the container
 * 3. Creates a new instance with resolved dependencies
 * 4. Registers the instance in the global container
 *
 * @param moduleClass - The module class constructor to instantiate
 * @returns The instantiated module instance
 *
 * @example
 * ```typescript
 * const instance = await instantiateModule(UserModule);
 * ```
 */
export const instantiateModule = async (
  moduleClass: Constructor,
): Promise<unknown> => {
  const dependencies = getDependencyTokens(moduleClass);
  const resolvedDependencies = await Promise.all(
    dependencies.map((dependency) =>
      container.resolve(moduleClass, dependency),
    ),
  );

  const instance = new moduleClass(...resolvedDependencies);
  container.registerInstance(moduleClass, instance);

  return instance;
};
