/**
 * @fileoverview Custom error classes for the dependency injection system.
 *
 * Provides specific error types for:
 * - Module registration issues
 * - Provider resolution failures
 * - Decorator validation
 * - Settings initialization
 *
 * All errors extend BaseError which sets the error name for better debugging.
 *
 * @module @core/errors
 */

/**
 * Base error class with custom name support.
 *
 * All framework errors extend this class to provide consistent error handling
 * with descriptive error names.
 */
class BaseError extends Error {
  constructor(msg: string, name: string) {
    super(msg);
    this.name = name;
  }
}

/**
 * Thrown when attempting to access a module that hasn't been registered.
 *
 * This typically indicates a programming error where a module is referenced
 * before bootstrapModules() is called or the module wasn't included in the
 * bootstrap array.
 */
export class ModuleNotRegisteredError extends BaseError {
  constructor(m: string) {
    super(
      `Module "${m}" is not registered in the container.`,
      "ModuleNotRegisteredError",
    );
  }
}

/**
 * Thrown when a provider cannot be resolved for a given token.
 *
 * This usually means:
 * - The provider wasn't registered in the module
 * - The provider wasn't exported by an imported module
 * - There's a typo in the provider token
 */
export class ProviderNotFoundError extends BaseError {
  constructor(t: string, m: string) {
    super(
      `Provider not found for token "${t}" in module "${m}" or its imports.`,
      "ProviderNotFoundError",
    );
  }
}

/**
 * Thrown when a module class is missing the @RgModule decorator.
 *
 * All modules passed to bootstrapModules() must be decorated with @RgModule
 * to define their metadata (providers, imports, exports, etc.).
 */
export class ModuleDecoratorMissingError extends BaseError {
  constructor(m: string) {
    super(
      `Module ${m} does not have the @RgModule decorator`,
      "ModuleDecoratorMissingError",
    );
  }
}

/**
 * Thrown when a provider definition is invalid.
 *
 * Providers must be either:
 * - A class constructor
 * - A provider object with 'provide' property
 */
export class InvalidProviderError extends BaseError {
  constructor(m: string) {
    super(
      `Invalid provider definition registered in module ${m}`,
      "InvalidProviderError",
    );
  }
}

/**
 * Thrown when attempting to access settings before initialization.
 *
 * Call initSettings() before bootstrapModules() to configure the application:
 * ```typescript
 * initSettings({
 *   localhostPort: '3000',
 *   folders: { distRenderer: 'dist-renderer', distMain: 'dist-main' }
 * });
 * await bootstrapModules([...]);
 * ```
 */
export class SettingsNotInitializedError extends BaseError {
  constructor() {
    super(
      "App settings cache has not been initialized.",
      "SettingsNotInitializedError",
    );
  }
}
