import { container } from "../container.js";
import type { Constructor } from "../types/constructor.js";
import { getDependencyTokens } from "../utils/dependency-tokens.js";

export async function instantiateModule(
  moduleClass: Constructor
): Promise<any> {
  const dependencies = getDependencyTokens(moduleClass);
  const resolvedDependencies = await Promise.all(
    dependencies.map(async (dependency) => {
      return container.resolve(moduleClass, dependency);
    })
  );
  const instance = new moduleClass(...resolvedDependencies);
  container.registerInstance(moduleClass, instance);
  return instance;
}
