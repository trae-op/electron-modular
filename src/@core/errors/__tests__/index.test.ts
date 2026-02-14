import { describe, it, expect } from "vitest";
import {
  DuplicateLazyTriggerError,
  EagerModuleCannotImportLazyModuleError,
  InvalidLazyTriggerError,
  LazyModuleCannotImportLazyModuleError,
  LazyModuleExportsNotAllowedError,
  ModuleNotRegisteredError,
  ProviderNotFoundError,
  ModuleDecoratorMissingError,
  InvalidProviderError,
  SettingsNotInitializedError,
} from "../index.js";

describe("Error classes", () => {
  describe("ModuleNotRegisteredError", () => {
    it("should create error with correct message", () => {
      const error = new ModuleNotRegisteredError("TestModule");
      expect(error.message).toBe(
        'Module "TestModule" is not registered in the container.',
      );
      expect(error.name).toBe("ModuleNotRegisteredError");
    });

    it("should be instanceof Error", () => {
      const error = new ModuleNotRegisteredError("TestModule");
      expect(error).toBeInstanceOf(Error);
    });

    it("should be instanceof ModuleNotRegisteredError", () => {
      const error = new ModuleNotRegisteredError("TestModule");
      expect(error).toBeInstanceOf(ModuleNotRegisteredError);
    });
  });

  describe("ProviderNotFoundError", () => {
    it("should create error with correct message", () => {
      const error = new ProviderNotFoundError("MyToken", "MyModule");
      expect(error.message).toBe(
        'Provider not found for token "MyToken" in module "MyModule" or its imports.',
      );
      expect(error.name).toBe("ProviderNotFoundError");
    });

    it("should be instanceof Error", () => {
      const error = new ProviderNotFoundError("token", "module");
      expect(error).toBeInstanceOf(Error);
    });

    it("should handle symbol tokens", () => {
      const error = new ProviderNotFoundError("Symbol(test)", "TestModule");
      expect(error.message).toContain("Symbol(test)");
    });
  });

  describe("ModuleDecoratorMissingError", () => {
    it("should create error with correct message", () => {
      const error = new ModuleDecoratorMissingError("TestModule");
      expect(error.message).toBe(
        "Module TestModule does not have the @RgModule decorator",
      );
      expect(error.name).toBe("ModuleDecoratorMissingError");
    });

    it("should be instanceof Error", () => {
      const error = new ModuleDecoratorMissingError("TestModule");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("InvalidProviderError", () => {
    it("should create error with correct message", () => {
      const error = new InvalidProviderError("TestModule");
      expect(error.message).toBe(
        "Invalid provider definition registered in module TestModule",
      );
      expect(error.name).toBe("InvalidProviderError");
    });

    it("should be instanceof Error", () => {
      const error = new InvalidProviderError("TestModule");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("SettingsNotInitializedError", () => {
    it("should create error with correct message", () => {
      const error = new SettingsNotInitializedError();
      expect(error.message).toBe(
        "App settings cache has not been initialized.",
      );
      expect(error.name).toBe("SettingsNotInitializedError");
    });

    it("should be instanceof Error", () => {
      const error = new SettingsNotInitializedError();
      expect(error).toBeInstanceOf(Error);
    });

    it("should not require any parameters", () => {
      expect(() => new SettingsNotInitializedError()).not.toThrow();
    });
  });

  describe("InvalidLazyTriggerError", () => {
    it("should create error with correct message", () => {
      const error = new InvalidLazyTriggerError("LazyModule");
      expect(error.message).toBe(
        'Invalid lazy trigger in module "LazyModule". "lazy.trigger" must be a non-empty string.',
      );
      expect(error.name).toBe("InvalidLazyTriggerError");
    });

    it("should be instanceof Error", () => {
      const error = new InvalidLazyTriggerError("LazyModule");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("DuplicateLazyTriggerError", () => {
    it("should create error with correct message", () => {
      const error = new DuplicateLazyTriggerError(
        "analytics",
        "ModuleA",
        "ModuleB",
      );
      expect(error.message).toBe(
        'Duplicate lazy trigger "analytics" detected in modules "ModuleA" and "ModuleB". Each lazy module must use a unique trigger.',
      );
      expect(error.name).toBe("DuplicateLazyTriggerError");
    });

    it("should be instanceof Error", () => {
      const error = new DuplicateLazyTriggerError(
        "analytics",
        "ModuleA",
        "ModuleB",
      );
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("LazyModuleExportsNotAllowedError", () => {
    it("should create error with correct message", () => {
      const error = new LazyModuleExportsNotAllowedError("AnalyticsModule");
      expect(error.message).toBe(
        'Invalid lazy module "AnalyticsModule". Lazy modules cannot declare exports.',
      );
      expect(error.name).toBe("LazyModuleExportsNotAllowedError");
    });

    it("should be instanceof Error", () => {
      const error = new LazyModuleExportsNotAllowedError("AnalyticsModule");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("LazyModuleCannotImportLazyModuleError", () => {
    it("should create error with correct message", () => {
      const error = new LazyModuleCannotImportLazyModuleError(
        "AnalyticsModule",
        "DatabaseModule",
      );
      expect(error.message).toBe(
        'Invalid lazy module "AnalyticsModule". It cannot import lazy module "DatabaseModule". Lazy modules can only import eager modules.',
      );
      expect(error.name).toBe("LazyModuleCannotImportLazyModuleError");
    });

    it("should be instanceof Error", () => {
      const error = new LazyModuleCannotImportLazyModuleError(
        "AnalyticsModule",
        "DatabaseModule",
      );
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("EagerModuleCannotImportLazyModuleError", () => {
    it("should create error with correct message", () => {
      const error = new EagerModuleCannotImportLazyModuleError(
        "AnalyticsModule",
        "DatabaseModule",
      );
      expect(error.message).toBe(
        'Invalid eager module "AnalyticsModule". It cannot import lazy module "DatabaseModule". Eager modules must import only eager modules.',
      );
      expect(error.name).toBe("EagerModuleCannotImportLazyModuleError");
    });

    it("should be instanceof Error", () => {
      const error = new EagerModuleCannotImportLazyModuleError(
        "AnalyticsModule",
        "DatabaseModule",
      );
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("Error throwing behavior", () => {
    it("should be catchable", () => {
      expect(() => {
        throw new ModuleNotRegisteredError("Test");
      }).toThrow(ModuleNotRegisteredError);
    });

    it("should preserve stack trace", () => {
      const error = new ProviderNotFoundError("token", "module");
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("ProviderNotFoundError");
    });
  });
});
