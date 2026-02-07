/**
 * @fileoverview Window manager instance creation.
 *
 * Instantiates window manager classes with their dependencies resolved from the container.
 * Uses reflection to discover constructor dependencies automatically.
 *
 * @module @core/bootstrap/initialize-ipc/window-instance-creator
 */

import type { Constructor } from "../../types/constructor.js";
import type { TWindowManagerWithHandlers } from "../../types/window-manager.js";
import { container } from "../../container.js";
import { getDependencyTokens } from "../../utils/dependency-tokens.js";

/**
 * Creates an instance of a window manager class with resolved dependencies.
 *
 * Process:
 * 1. Extracts constructor parameter types using reflection
 * 2. Resolves each dependency from the container
 * 3. Instantiates the window manager with resolved dependencies
 *
 * @param moduleClass - The module context for dependency resolution
 * @param windowClass - The window manager class constructor
 * @returns Instantiated window manager or undefined if class is invalid
 *
 * @example
 * ```typescript
 * const instance = await createWindowInstance(UserModule, UserWindow);
 * ```
 */
export const createWindowInstance = async <
  T extends TWindowManagerWithHandlers,
>(
  moduleClass: Constructor,
  windowClass: Constructor<T>,
): Promise<T | undefined> => {
  if (!windowClass) {
    return undefined;
  }

  const dependenciesTypes = getDependencyTokens(windowClass);
  const resolvedDependencies = await Promise.all(
    dependenciesTypes.map((depType) => container.resolve(moduleClass, depType)),
  );

  return new windowClass(...resolvedDependencies);
};
