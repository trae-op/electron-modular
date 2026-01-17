export class ModuleNotRegisteredError extends Error {
  constructor(moduleName: string) {
    super(`Module "${moduleName}" is not registered in the container.`);
    this.name = "ModuleNotRegisteredError";
  }
}

export class ProviderNotFoundError extends Error {
  constructor(token: string, moduleName: string) {
    super(
      `Provider not found for token "${token}" in module "${moduleName}" or its imports.`,
    );
    this.name = "ProviderNotFoundError";
  }
}

export class ModuleDecoratorMissingError extends Error {
  constructor(moduleName: string) {
    super(`Module ${moduleName} does not have the @RgModule decorator`);
    this.name = "ModuleDecoratorMissingError";
  }
}

export class InvalidProviderError extends Error {
  constructor(moduleName: string) {
    super(`Invalid provider definition registered in module ${moduleName}`);
    this.name = "InvalidProviderError";
  }
}

export class SettingsNotInitializedError extends Error {
  constructor() {
    super("App settings cache has not been initialized.");
    this.name = "SettingsNotInitializedError";
  }
}
