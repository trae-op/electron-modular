import type { Constructor } from "../../types/constructor.js";
import type { TWindowManagerWithHandlers } from "../../types/window-manager.js";
import { container } from "../../container.js";
import { getDependencyTokens } from "../../utils/dependency-tokens.js";

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
