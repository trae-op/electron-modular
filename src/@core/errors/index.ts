class BaseError extends Error {
  constructor(msg: string, name: string) {
    super(msg);
    this.name = name;
  }
}

export class ModuleNotRegisteredError extends BaseError {
  constructor(m: string) {
    super(
      `Module "${m}" is not registered in the container.`,
      "ModuleNotRegisteredError",
    );
  }
}

export class ProviderNotFoundError extends BaseError {
  constructor(t: string, m: string) {
    super(
      `Provider not found for token "${t}" in module "${m}" or its imports.`,
      "ProviderNotFoundError",
    );
  }
}

export class ModuleDecoratorMissingError extends BaseError {
  constructor(m: string) {
    super(
      `Module ${m} does not have the @RgModule decorator`,
      "ModuleDecoratorMissingError",
    );
  }
}

export class InvalidProviderError extends BaseError {
  constructor(m: string) {
    super(
      `Invalid provider definition registered in module ${m}`,
      "InvalidProviderError",
    );
  }
}

export class SettingsNotInitializedError extends BaseError {
  constructor() {
    super(
      "App settings cache has not been initialized.",
      "SettingsNotInitializedError",
    );
  }
}
