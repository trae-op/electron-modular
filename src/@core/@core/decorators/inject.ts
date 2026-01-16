import "reflect-metadata/lite";
import type { TProviderToken } from "../types/provider.js";

type TInjectTokensMetadata = Record<number, TProviderToken>;

const INJECT_TOKENS_METADATA_KEY = "RgInjectTokens";

export const Inject = (token: TProviderToken): ParameterDecorator => {
  return (target, propertyKey, parameterIndex) => {
    if (propertyKey !== undefined) {
      return;
    }

    const existingTokens: TInjectTokensMetadata =
      Reflect.getMetadata(INJECT_TOKENS_METADATA_KEY, target) ?? {};

    existingTokens[parameterIndex] = token;

    Reflect.defineMetadata(INJECT_TOKENS_METADATA_KEY, existingTokens, target);
  };
};

export const getInjectedTokens = (target: Function): TInjectTokensMetadata => {
  return Reflect.getMetadata(INJECT_TOKENS_METADATA_KEY, target) ?? {};
};
