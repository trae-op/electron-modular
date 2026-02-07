/**
 * @fileoverview Dependency injection container for managing modules and providers.
 *
 * The Container class is the core of the dependency injection system. It:
 * - Registers and manages modules
 * - Resolves dependencies automatically
 * - Instantiates services with their dependencies
 * - Handles different provider types (class, factory, value, existing)
 * - Caches instances for singleton behavior
 * - Supports module imports and exports for cross-module dependencies
 *
 * @module @core/container
 */

import type { Constructor } from "./types/constructor.js";
import type { RgModuleMetadata } from "./types/module-metadata.js";
import type {
  TClassProvider,
  TExistingProvider,
  TFactoryProvider,
  TProviderToken,
  TValueProvider,
} from "./types/provider.js";
import { getDependencyTokens } from "./utils/dependency-tokens.js";
import {
  ModuleNotRegisteredError,
  ProviderNotFoundError,
} from "./errors/index.js";

/**
 * Internal module data structure storing providers and exports.
 */
type TModuleData = {
  providers: Map<TProviderToken, unknown>;
  exports: Set<TProviderToken>;
};

/**
 * Dependency injection container for managing modules and their providers.
 *
 * The container handles the entire lifecycle of dependency resolution:
 * 1. Module registration
 * 2. Provider registration
 * 3. Dependency resolution
 * 4. Instance creation and caching
 */
export class Container {
  /** Stores module data including providers and exports for each registered module */
  private readonly modules = new Map<Constructor, TModuleData>();

  /** Stores metadata for each module (imports, providers, IPC handlers, windows) */
  private readonly moduleMetadata = new Map<Constructor, RgModuleMetadata>();

  /** Global instance cache for singleton providers */
  private readonly instances = new Map<TProviderToken, unknown>();

  /** Resolution cache to optimize repeated dependency lookups */
  private readonly resolutionCache = new Map<string, unknown>();

  /**
   * Adds a new module to the container.
   *
   * @param moduleClass - The module class constructor
   * @param metadata - Module metadata containing providers and exports
   * @returns true if module was added, false if it already exists
   */
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

  /**
   * Stores complete metadata for a module.
   *
   * @param moduleClass - The module class constructor
   * @param metadata - Complete module metadata
   */
  setModuleMetadata(
    moduleClass: Constructor,
    metadata: RgModuleMetadata,
  ): void {
    this.moduleMetadata.set(moduleClass, metadata);
  }

  /**
   * Checks if a module is registered in the container.
   *
   * @param moduleClass - The module class constructor to check
   * @returns true if module exists
   */
  hasModule(moduleClass: Constructor): boolean {
    return this.modules.has(moduleClass);
  }

  /**
   * Generates a unique cache key for module-provider combinations.
   *
   * @param moduleClass - The module class constructor
   * @param token - The provider token (Symbol, string, or constructor)
   * @returns Cache key in format "ModuleName:TokenName"
   */
  private getCacheKey(moduleClass: Constructor, token: TProviderToken): string {
    const tokenKey =
      typeof token === "string" || typeof token === "symbol"
        ? String(token)
        : token.name;
    return `${moduleClass.name}:${tokenKey}`;
  }

  /**
   * Registers a provider instance for a module.
   *
   * @param moduleClass - The module class constructor
   * @param provider - The provider token or class
   * @param instance - Optional instance to register (for already-instantiated providers)
   * @throws {ModuleNotRegisteredError} If the module hasn't been registered
   */
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

  /**
   * Retrieves a provider from a module's provider map.
   *
   * @param moduleClass - The module class constructor
   * @param token - The provider token to retrieve
   * @returns The provider instance or undefined if not found
   */
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

  /**
   * Gets the set of exported providers for a module.
   *
   * @param moduleClass - The module class constructor
   * @returns Set of exported provider tokens
   */
  getModuleExports(moduleClass: Constructor): Set<TProviderToken> {
    const moduleData = this.modules.get(moduleClass);
    return moduleData?.exports ?? new Set();
  }

  /**
   * Retrieves complete metadata for a module.
   *
   * @param moduleClass - The module class constructor
   * @returns Module metadata or undefined if not found
   */
  getModuleMetadata(moduleClass: Constructor): RgModuleMetadata | undefined {
    return this.moduleMetadata.get(moduleClass);
  }

  /**
   * Registers an instance in the global instance cache.
   * Used for singleton providers that should be shared across modules.
   *
   * @param token - The provider token
   * @param instance - The instance to cache
   */
  registerInstance(token: TProviderToken, instance: unknown): void {
    this.instances.set(token, instance);
  }

  /**
   * Resolves a dependency by token within a module context.
   *
   * This is the main dependency resolution method that:
   * 1. Checks resolution cache for previous lookups
   * 2. Checks global instance cache
   * 3. Looks up provider in current module
   * 4. Falls back to imported modules
   * 5. Instantiates the provider if needed
   * 6. Caches the result
   *
   * @param moduleClass - The module requesting the dependency
   * @param token - The provider token to resolve
   * @returns Resolved instance or undefined
   * @throws {ProviderNotFoundError} If provider cannot be found
   */
  async resolve<T>(
    moduleClass: Constructor,
    token: TProviderToken,
  ): Promise<T | undefined> {
    const cacheKey = this.getCacheKey(moduleClass, token);

    // Check resolution cache first
    if (this.resolutionCache.has(cacheKey)) {
      return this.resolutionCache.get(cacheKey) as T;
    }

    // Check global instance cache
    if (this.instances.has(token)) {
      const instance = this.instances.get(token) as T;
      this.resolutionCache.set(cacheKey, instance);
      return instance;
    }

    // Get provider from current module
    const provider = this.getProvider(moduleClass, token);

    if (!provider) {
      // Try to resolve from imported modules
      const resolvedFromImports = await this.resolveFromImports<T>(
        moduleClass,
        token,
      );

      if (resolvedFromImports !== undefined) {
        this.resolutionCache.set(cacheKey, resolvedFromImports);
        return resolvedFromImports;
      }

      // If token is not the module itself, throw error
      if (token !== moduleClass) {
        throw new ProviderNotFoundError(String(token), moduleClass.name);
      }

      return undefined;
    }

    // Instantiate the provider
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

  /**
   * Attempts to resolve a dependency from imported modules.
   *
   * When a dependency is not found in the current module, this method
   * searches through all imported modules for exported providers matching the token.
   *
   * @param moduleClass - The module requesting the dependency
   * @param token - The provider token to resolve
   * @returns Resolved instance or undefined
   */
  private async resolveFromImports<T>(
    moduleClass: Constructor,
    token: TProviderToken,
  ): Promise<T | undefined> {
    const moduleMetadata = this.getModuleMetadata(moduleClass);

    if (!moduleMetadata?.imports) {
      return undefined;
    }

    // Search through all imported modules
    for (const importedModuleClass of moduleMetadata.imports) {
      const exportedProviders = this.getModuleExports(importedModuleClass);

      // Check if the imported module exports this token
      if (exportedProviders.has(token)) {
        const exportedProvider = this.getProvider(importedModuleClass, token);

        if (exportedProvider !== undefined) {
          return this.resolve<T>(importedModuleClass, token);
        }
      }
    }

    return undefined;
  }

  /**
   * Instantiates a provider based on its type.
   *
   * Handles different provider types:
   * - Factory providers (useFactory)
   * - Class providers (useClass)
   * - Value providers (useValue)
   * - Existing providers (useExisting)
   * - Direct class constructors
   *
   * @param moduleClass - The module context
   * @param token - The provider token
   * @param provider - The provider definition
   * @returns Instantiated provider
   */
  private async instantiateProvider<T>(
    moduleClass: Constructor,
    token: TProviderToken,
    provider: unknown,
  ): Promise<T | undefined> {
    const isObj =
      typeof provider === "object" &&
      provider !== null &&
      "provide" in provider;

    // Handle factory providers (useFactory)
    if (
      isObj &&
      "useFactory" in provider &&
      typeof (provider as any).useFactory === "function"
    ) {
      return this.instantiateFactoryProvider<T>(
        moduleClass,
        token,
        provider as TFactoryProvider,
      );
    }

    // Handle class providers (useClass)
    if (
      isObj &&
      "useClass" in provider &&
      typeof (provider as any).useClass === "function"
    ) {
      return this.instantiateClassProvider<T>(
        moduleClass,
        token,
        provider as TClassProvider,
      );
    }

    // Handle value providers (useValue)
    if (isObj && "useValue" in provider) {
      const val = (provider as TValueProvider).useValue;
      this.instances.set(token, val);
      return val as T;
    }

    // Handle existing providers (useExisting) - alias to another provider
    if (isObj && "useExisting" in provider) {
      const instance = await this.resolve<T>(
        moduleClass,
        (provider as TExistingProvider).useExisting,
      );
      if (instance !== undefined) {
        this.instances.set(token, instance);
      }
      return instance;
    }

    // Handle direct class constructors
    if (typeof provider === "function") {
      return this.instantiateClassConstructor<T>(
        moduleClass,
        token,
        provider as Constructor,
      );
    }

    return provider as T;
  }

  /**
   * Instantiates a factory provider by calling its factory function with dependencies.
   *
   * @param moduleClass - The module context
   * @param token - The provider token
   * @param provider - The factory provider configuration
   * @returns Instantiated provider
   */
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

  /**
   * Instantiates a class provider with its dependencies.
   *
   * @param moduleClass - The module context
   * @param token - The provider token
   * @param provider - The class provider configuration
   * @returns Instantiated provider
   */
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

  /**
   * Instantiates a class constructor directly with auto-resolved dependencies.
   *
   * Uses reflection to get constructor parameter types and resolves them automatically.
   *
   * @param moduleClass - The module context
   * @param token - The provider token
   * @param providerClass - The class constructor
   * @returns Instantiated provider
   */
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

  /**
   * Resolves an array of dependency tokens to their instances.
   *
   * @param moduleClass - The module context
   * @param dependencies - Array of dependency tokens to resolve
   * @returns Array of resolved instances
   */
  private async resolveDependencies(
    moduleClass: Constructor,
    dependencies: TProviderToken[],
  ): Promise<unknown[]> {
    return Promise.all(
      dependencies.map((dep) => this.resolve(moduleClass, dep)),
    );
  }
}

/**
 * Global singleton instance of the dependency injection container.
 * This is the main entry point for all container operations.
 */
export const container = new Container();
