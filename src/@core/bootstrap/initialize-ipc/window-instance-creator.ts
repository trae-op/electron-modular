import { container } from "../../container.js";
import type { Constructor } from "../../types/constructor.js";
import type { TWindowManagerWithHandlers } from "../../types/window-manager.js";
import { getDependencyTokens } from "../../utils/dependency-tokens.js";

export async function createWindowInstance<
  T extends TWindowManagerWithHandlers
>(
  moduleClass: Constructor,
  windowClass: Constructor<T>
): Promise<T | undefined> {
  if (!windowClass) {
    return undefined;
  }

  const dependenciesTypes = getDependencyTokens(windowClass);

  const resolvedDependencies = await Promise.all(
    dependenciesTypes.map((depType: any) =>
      container.resolve(moduleClass, depType)
    )
  );

  const windowInstance = new windowClass(...resolvedDependencies);
  return windowInstance;
}
