import type { Constructor } from "./constructor.js";

export type TProviderToken<T = any> = Constructor<T> | string | symbol;

export type TClassProvider<T = any> = {
  provide: TProviderToken<T>;
  useClass: Constructor<T>;
  inject?: TProviderToken[];
};

export type TFactoryProvider<T = any> = {
  provide: TProviderToken<T>;
  useFactory: (...args: any[]) => T;
  inject?: TProviderToken[];
};

export type TValueProvider<T = any> = {
  provide: TProviderToken<T>;
  useValue: T;
};

export type TExistingProvider<T = any> = {
  provide: TProviderToken<T>;
  useExisting: TProviderToken<T>;
};

export type TProvider<T = any> =
  | Constructor<T>
  | TClassProvider<T>
  | TFactoryProvider<T>
  | TValueProvider<T>
  | TExistingProvider<T>;
