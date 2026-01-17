import "reflect-metadata/lite";
import type { Constructor } from "../types/constructor.js";
import type { TProviderToken } from "../types/provider.js";
import { getInjectedTokens } from "../decorators/inject.js";

const dependencyTokensCache = new WeakMap<Constructor, TProviderToken[]>();

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
