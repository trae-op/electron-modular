/**
 * @fileoverview Dependency token resolution utility.
 *
 * Extracts constructor parameter types using TypeScript's reflection metadata
 * and merges them with manually injected tokens from @Inject decorator.
 *
 * @module @core/utils/dependency-tokens
 */

import "reflect-metadata/lite";
import type { Constructor } from "../types/constructor.js";
import type { TProviderToken } from "../types/provider.js";
import { getInjectedTokens } from "../decorators/inject.js";

/** Cache to avoid repeated reflection lookups */
const dependencyTokensCache = new WeakMap<Constructor, TProviderToken[]>();

/**
 * Extracts dependency tokens from a class constructor.
 *
 * Process:
 * 1. Checks cache for previous results
 * 2. Gets constructor parameter types from TypeScript metadata
 * 3. Gets manually injected tokens from @Inject decorator
 * 4. Merges both, with @Inject tokens taking precedence
 * 5. Caches the result
 *
 * @param target - Class constructor to extract dependencies from
 * @returns Array of provider tokens for each constructor parameter
 *
 * @example
 * ```typescript
 * // For class: constructor(private userService: UserService)
 * const tokens = getDependencyTokens(MyClass);
 * // Returns: [UserService]
 *
 * // For class: constructor(@Inject(API_TOKEN) private api: TApi)
 * const tokens = getDependencyTokens(MyClass);
 * // Returns: [API_TOKEN]
 * ```
 */
export const getDependencyTokens = (target: Constructor): TProviderToken[] => {
  const cached = dependencyTokensCache.get(target);
  if (cached !== undefined) {
    return cached;
  }

  const paramTypes = (Reflect.getMetadata("design:paramtypes", target) ??
    []) as TProviderToken[];
  const injectedTokens = getInjectedTokens(target);
  const injectedIndexes = Object.keys(injectedTokens).map(Number);
  const maxIndex = Math.max(paramTypes.length - 1, ...injectedIndexes, -1);

  if (maxIndex < 0) {
    dependencyTokensCache.set(target, paramTypes);
    return paramTypes;
  }

  const tokens = Array.from({ length: maxIndex + 1 }, (_, index) => {
    return injectedTokens[index] ?? paramTypes[index];
  });

  dependencyTokensCache.set(target, tokens);
  return tokens;
};
