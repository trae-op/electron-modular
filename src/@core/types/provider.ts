/**
 * @fileoverview Provider type definitions for dependency injection.
 *
 * Defines all supported provider types:
 * - Class providers (with custom token)
 * - Factory providers (function-based instantiation)
 * - Value providers (pre-instantiated values)
 * - Existing providers (aliases to other providers)
 * - Simple class constructors
 *
 * @module @core/types/provider
 */

import type { Constructor } from "./constructor.js";

/**
 * Token used to identify a provider in the DI container.
 * Can be a class constructor, string, or Symbol.
 */
export type TProviderToken<T = any> = Constructor<T> | string | symbol;

/**
 * Provider that uses a custom class with explicit token.
 *
 * Use when you want to register a class with a different token than the class itself.
 */
export type TClassProvider<T = any> = {
  provide: TProviderToken<T>;
  useClass: Constructor<T>;
  inject?: TProviderToken[];
};

/**
 * Provider that uses a factory function to create instances.
 *
 * Use when instance creation requires custom logic or conditional configuration.
 */
export type TFactoryProvider<T = any> = {
  provide: TProviderToken<T>;
  useFactory: (...args: any[]) => T;
  inject?: TProviderToken[];
};

/**
 * Provider that uses a pre-instantiated value.
 *
 * Use for configuration objects, constants, or pre-created instances.
 */
export type TValueProvider<T = any> = {
  provide: TProviderToken<T>;
  useValue: T;
};

/**
 * Provider that creates an alias to another provider.
 *
 * Use when you want multiple tokens to resolve to the same instance.
 */
export type TExistingProvider<T = any> = {
  provide: TProviderToken<T>;
  useExisting: TProviderToken<T>;
};

/**
 * Union type of all supported provider formats.
 *
 * Can be:
 * - Direct class constructor
 * - Class provider with custom token
 * - Factory provider
 * - Value provider
 * - Existing provider (alias)
 */
export type TProvider<T = any> =
  | Constructor<T>
  | TClassProvider<T>
  | TFactoryProvider<T>
  | TValueProvider<T>
  | TExistingProvider<T>;
