import type { Constructor } from "./types/constructor.js";
import type { RgModuleMetadata } from "./types/module-metadata.js";
import type {
  TClassProvider,
  TExistingProvider,
  TFactoryProvider,
  TProvider,
  TProviderToken,
  TValueProvider,
} from "./types/provider.js";
import { getDependencyTokens } from "./utils/dependency-tokens.js";

type TModuleData = {
  providers: Map<TProviderToken, any>;
  exports: Set<TProviderToken>;
};

export class Container {
  private modules = new Map<Constructor, TModuleData>();
  private moduleMetadata = new Map<Constructor, RgModuleMetadata>();
  private instances = new Map<any, any>();

  addModule(
    moduleClass: Constructor,
    metadata: Pick<RgModuleMetadata, "exports" | "providers">
  ): boolean {
    if (this.modules.has(moduleClass)) {
      return false;
    }

    this.modules.set(moduleClass, {
      providers: new Map(),
      exports: new Set(metadata.exports || []),
    });
    return true;
  }

  setModuleMetadata(
    moduleClass: Constructor,
    metadata: RgModuleMetadata
  ): void {
    this.moduleMetadata.set(moduleClass, metadata);
  }

  hasModule(moduleClass: Constructor): boolean {
    return this.modules.has(moduleClass);
  }

  addProvider(
    moduleClass: Constructor,
    provider: TProviderToken,
    instance?: any
  ): void {
    const moduleData = this.modules.get(moduleClass);
    if (!moduleData) {
      throw new Error(
        `Error: Module "${moduleClass.name}" is not registered in the container.`
      );
    }

    moduleData.providers.set(provider, instance ?? provider);
  }

  getProvider<T = any>(
    moduleClass: Constructor,
    token: TProviderToken
  ): T | undefined {
    const moduleData = this.modules.get(moduleClass);
    if (moduleData && moduleData.providers.has(token)) {
      return moduleData.providers.get(token);
    }
    return undefined;
  }

  getModuleExports(moduleClass: Constructor): Set<TProviderToken> {
    const moduleData = this.modules.get(moduleClass);
    return moduleData?.exports || new Set();
  }

  getModuleMetadata(moduleClass: Constructor): RgModuleMetadata | undefined {
    return this.moduleMetadata.get(moduleClass);
  }

  registerInstance(token: TProviderToken, instance: any): void {
    this.instances.set(token, instance);
  }

  async resolve<T>(
    moduleClass: Constructor,
    token: TProviderToken
  ): Promise<T | undefined> {
    if (this.instances.has(token)) {
      return this.instances.get(token) as T;
    }

    const provider = this.getProvider(moduleClass, token);

    if (!provider) {
      // Let's try to find the exported provider in the imported modules
      const moduleMetadata = this.getModuleMetadata(moduleClass);
      if (moduleMetadata?.imports) {
        for (const importedModuleClass of moduleMetadata.imports) {
          const exportedProviders = this.getModuleExports(importedModuleClass);
          if (exportedProviders.has(token)) {
            const exportedProvider = this.getProvider(
              importedModuleClass,
              token
            );
            if (exportedProvider) {
              return this.resolve(importedModuleClass, token);
            }
          }
        }
      }

      if (!provider && token !== moduleClass) {
        throw new Error(
          `Error: Provider not found for token "${String(token)}" in module "${
            moduleClass.name
          }" or its imports.`
        );
      }

      return undefined;
    }

    // If the provider is already instantiated (singleton), return it
    if (typeof provider !== "function" && this.instances.has(token)) {
      return this.instances.get(token) as T;
    }

    if (this.isFactoryProvider(provider)) {
      const dependencies = provider.inject ?? [];
      const resolvedDependencies = await Promise.all(
        dependencies.map(async (dep: any) => this.resolve(moduleClass, dep))
      );
      const instance = provider.useFactory(...resolvedDependencies);
      this.instances.set(token, instance);
      return instance as T;
    }

    if (this.isClassProvider(provider)) {
      const dependencies =
        provider.inject ?? getDependencyTokens(provider.useClass);
      const resolvedDependencies = await Promise.all(
        dependencies.map(async (dep: any) => this.resolve(moduleClass, dep))
      );
      const instance = new provider.useClass(...resolvedDependencies);
      this.instances.set(token, instance);
      return instance as T;
    }

    if (this.isValueProvider(provider)) {
      this.instances.set(token, provider.useValue);
      return provider.useValue as T;
    }

    if (this.isExistingProvider(provider)) {
      const instance = await this.resolve(moduleClass, provider.useExisting);
      this.instances.set(token, instance);
      return instance as T;
    }

    // If the provider is a class, instantiate it
    if (typeof provider === "function") {
      const dependencies = getDependencyTokens(provider);
      const resolvedDependencies = await Promise.all(
        dependencies.map(async (dep: any) => this.resolve(moduleClass, dep))
      );
      const instance = new provider(...resolvedDependencies);
      this.instances.set(token, instance);
      return instance as T;
    }

    // If provider is a value (return)
    return provider as T;
  }

  private isProviderObject(provider: unknown): provider is TProvider {
    return (
      typeof provider === "object" && provider !== null && "provide" in provider
    );
  }

  private isFactoryProvider(provider: unknown): provider is TFactoryProvider {
    return (
      this.isProviderObject(provider) &&
      "useFactory" in provider &&
      typeof provider.useFactory === "function"
    );
  }

  private isClassProvider(provider: unknown): provider is TClassProvider {
    return (
      this.isProviderObject(provider) &&
      "useClass" in provider &&
      typeof provider.useClass === "function"
    );
  }

  private isValueProvider(provider: unknown): provider is TValueProvider {
    return this.isProviderObject(provider) && "useValue" in provider;
  }

  private isExistingProvider(provider: unknown): provider is TExistingProvider {
    return this.isProviderObject(provider) && "useExisting" in provider;
  }
}

export const container = new Container();
