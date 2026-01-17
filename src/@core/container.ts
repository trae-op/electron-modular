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
import {
  ModuleNotRegisteredError,
  ProviderNotFoundError,
} from "./errors/index.js";

type TModuleData = {
  providers: Map<TProviderToken, unknown>;
  exports: Set<TProviderToken>;
};

export class Container {
  private readonly modules = new Map<Constructor, TModuleData>();
  private readonly moduleMetadata = new Map<Constructor, RgModuleMetadata>();
  private readonly instances = new Map<TProviderToken, unknown>();
  private readonly resolutionCache = new Map<string, unknown>();

  addModule(
    moduleClass: Constructor,
    metadata: Pick<RgModuleMetadata, "exports" | "providers">,
  ): boolean {
    if (this.modules.has(moduleClass)) {
      return false;
    }

    this.modules.set(moduleClass, {
      providers: new Map(),
      exports: new Set(metadata.exports ?? []),
    });
    return true;
  }

  setModuleMetadata(
    moduleClass: Constructor,
    metadata: RgModuleMetadata,
  ): void {
    this.moduleMetadata.set(moduleClass, metadata);
  }

  hasModule(moduleClass: Constructor): boolean {
    return this.modules.has(moduleClass);
  }

  private getCacheKey(moduleClass: Constructor, token: TProviderToken): string {
    const tokenKey =
      typeof token === "string" || typeof token === "symbol"
        ? String(token)
        : token.name;
    return `${moduleClass.name}:${tokenKey}`;
  }

  addProvider(
    moduleClass: Constructor,
    provider: TProviderToken,
    instance?: unknown,
  ): void {
    const moduleData = this.modules.get(moduleClass);
    if (!moduleData) {
      throw new ModuleNotRegisteredError(moduleClass.name);
    }

    moduleData.providers.set(provider, instance ?? provider);
  }

  getProvider<T = unknown>(
    moduleClass: Constructor,
    token: TProviderToken,
  ): T | undefined {
    const moduleData = this.modules.get(moduleClass);
    if (!moduleData) {
      return undefined;
    }

    return moduleData.providers.get(token) as T | undefined;
  }

  getModuleExports(moduleClass: Constructor): Set<TProviderToken> {
    const moduleData = this.modules.get(moduleClass);
    return moduleData?.exports ?? new Set();
  }

  getModuleMetadata(moduleClass: Constructor): RgModuleMetadata | undefined {
    return this.moduleMetadata.get(moduleClass);
  }

  registerInstance(token: TProviderToken, instance: unknown): void {
    this.instances.set(token, instance);
  }

  async resolve<T>(
    moduleClass: Constructor,
    token: TProviderToken,
  ): Promise<T | undefined> {
    const cacheKey = this.getCacheKey(moduleClass, token);

    if (this.resolutionCache.has(cacheKey)) {
      return this.resolutionCache.get(cacheKey) as T;
    }

    if (this.instances.has(token)) {
      const instance = this.instances.get(token) as T;
      this.resolutionCache.set(cacheKey, instance);
      return instance;
    }

    const provider = this.getProvider(moduleClass, token);

    if (!provider) {
      const resolvedFromImports = await this.resolveFromImports<T>(
        moduleClass,
        token,
      );

      if (resolvedFromImports !== undefined) {
        this.resolutionCache.set(cacheKey, resolvedFromImports);
        return resolvedFromImports;
      }

      if (token !== moduleClass) {
        throw new ProviderNotFoundError(String(token), moduleClass.name);
      }

      return undefined;
    }

    const instance = await this.instantiateProvider<T>(
      moduleClass,
      token,
      provider,
    );

    if (instance !== undefined) {
      this.resolutionCache.set(cacheKey, instance);
    }

    return instance;
  }

  private async resolveFromImports<T>(
    moduleClass: Constructor,
    token: TProviderToken,
  ): Promise<T | undefined> {
    const moduleMetadata = this.getModuleMetadata(moduleClass);

    if (!moduleMetadata?.imports) {
      return undefined;
    }

    for (const importedModuleClass of moduleMetadata.imports) {
      const exportedProviders = this.getModuleExports(importedModuleClass);

      if (exportedProviders.has(token)) {
        const exportedProvider = this.getProvider(importedModuleClass, token);

        if (exportedProvider !== undefined) {
          return this.resolve<T>(importedModuleClass, token);
        }
      }
    }

    return undefined;
  }

  private async instantiateProvider<T>(
    moduleClass: Constructor,
    token: TProviderToken,
    provider: unknown,
  ): Promise<T | undefined> {
    if (this.isFactoryProvider(provider)) {
      return this.instantiateFactoryProvider<T>(moduleClass, token, provider);
    }

    if (this.isClassProvider(provider)) {
      return this.instantiateClassProvider<T>(moduleClass, token, provider);
    }

    if (this.isValueProvider(provider)) {
      this.instances.set(token, provider.useValue);
      return provider.useValue as T;
    }

    if (this.isExistingProvider(provider)) {
      const instance = await this.resolve<T>(moduleClass, provider.useExisting);
      if (instance !== undefined) {
        this.instances.set(token, instance);
      }
      return instance;
    }

    if (typeof provider === "function") {
      return this.instantiateClassConstructor<T>(
        moduleClass,
        token,
        provider as Constructor,
      );
    }

    return provider as T;
  }

  private async instantiateFactoryProvider<T>(
    moduleClass: Constructor,
    token: TProviderToken,
    provider: TFactoryProvider,
  ): Promise<T> {
    const dependencies = provider.inject ?? [];
    const resolvedDependencies = await this.resolveDependencies(
      moduleClass,
      dependencies,
    );
    const instance = provider.useFactory(...resolvedDependencies);
    this.instances.set(token, instance);
    return instance as T;
  }

  private async instantiateClassProvider<T>(
    moduleClass: Constructor,
    token: TProviderToken,
    provider: TClassProvider,
  ): Promise<T> {
    const dependencies =
      provider.inject ?? getDependencyTokens(provider.useClass);
    const resolvedDependencies = await this.resolveDependencies(
      moduleClass,
      dependencies,
    );
    const instance = new provider.useClass(...resolvedDependencies);
    this.instances.set(token, instance);
    return instance as T;
  }

  private async instantiateClassConstructor<T>(
    moduleClass: Constructor,
    token: TProviderToken,
    providerClass: Constructor,
  ): Promise<T> {
    const dependencies = getDependencyTokens(providerClass);
    const resolvedDependencies = await this.resolveDependencies(
      moduleClass,
      dependencies,
    );
    const instance = new providerClass(...resolvedDependencies);
    this.instances.set(token, instance);
    return instance as T;
  }

  private async resolveDependencies(
    moduleClass: Constructor,
    dependencies: TProviderToken[],
  ): Promise<unknown[]> {
    return Promise.all(
      dependencies.map((dep) => this.resolve(moduleClass, dep)),
    );
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
