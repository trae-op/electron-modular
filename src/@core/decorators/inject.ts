/**
 * @fileoverview @Inject decorator for custom dependency injection.
 *
 * The @Inject decorator allows injecting dependencies by custom tokens (Symbols)
 * instead of relying on TypeScript's reflected types. This is useful for:
 * - Provider pattern (injecting interfaces instead of concrete classes)
 * - Avoiding circular dependencies
 * - Runtime token-based injection
 *
 * @module @core/decorators/inject
 */

import "../../reflect-metadata.js";
import type { TProviderToken } from "../types/provider.js";

/** Maps parameter index to provider token */
type TInjectTokensMetadata = Record<number, TProviderToken>;

/** Metadata key for storing inject tokens */
const INJECT_TOKENS_METADATA_KEY = "RgInjectTokens";

/**
 * Parameter decorator for injecting dependencies by custom token.
 *
 * Use this when you need to inject by Symbol token instead of class type.
 *
 * @param token - Provider token (Symbol, string, or class) to inject
 * @returns ParameterDecorator function
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   constructor(
 *     @Inject(REST_API_PROVIDER) private restApi: TRestApiProvider
 *   ) {}
 * }
 * ```
 */
export const Inject = (token: TProviderToken): ParameterDecorator => {
  return (target, propertyKey, parameterIndex) => {
    if (propertyKey !== undefined) {
      return;
    }

    const existingTokens =
      (Reflect.getMetadata(INJECT_TOKENS_METADATA_KEY, target) as
        | TInjectTokensMetadata
        | undefined) ?? ({} as TInjectTokensMetadata);

    existingTokens[parameterIndex] = token;

    Reflect.defineMetadata(INJECT_TOKENS_METADATA_KEY, existingTokens, target);
  };
};

/**
 * Retrieves injected tokens metadata from a class constructor.
 *
 * Used by the container to resolve dependencies specified via @Inject decorator.
 *
 * @param target - Class constructor to get injection tokens from
 * @returns Map of parameter index to provider token
 */
export const getInjectedTokens = (target: Function): TInjectTokensMetadata => {
  return (
    (Reflect.getMetadata(INJECT_TOKENS_METADATA_KEY, target) as
      | TInjectTokensMetadata
      | undefined) ?? ({} as TInjectTokensMetadata)
  );
};
