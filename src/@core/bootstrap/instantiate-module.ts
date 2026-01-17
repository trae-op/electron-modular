import type { Constructor } from "../types/constructor.js";
import { container } from "../container.js";
import { getDependencyTokens } from "../utils/dependency-tokens.js";

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
