import { describe, expect, it } from "vitest";
import {
  ModuleNotRegisteredError,
  ProviderNotFoundError,
  ModuleDecoratorMissingError,
  InvalidProviderError,
  SettingsNotInitializedError,
} from "../../src/@core/errors/index.js";

describe("Error Classes", () => {
  describe("ModuleNotRegisteredError", () => {
    it("should create error with correct message", () => {
      const error = new ModuleNotRegisteredError("TestModule");

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("ModuleNotRegisteredError");
      expect(error.message).toBe(
        'Module "TestModule" is not registered in the container.',
      );
    });

    it("should be throwable", () => {
      expect(() => {
        throw new ModuleNotRegisteredError("MyModule");
      }).toThrow(ModuleNotRegisteredError);
    });

    it("should be catchable", () => {
      try {
        throw new ModuleNotRegisteredError("TestModule");
      } catch (error) {
        expect(error).toBeInstanceOf(ModuleNotRegisteredError);
        expect((error as ModuleNotRegisteredError).message).toContain(
          "TestModule",
        );
      }
    });
  });

  describe("ProviderNotFoundError", () => {
    it("should create error with correct message", () => {
      const error = new ProviderNotFoundError("MyService", "TestModule");

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("ProviderNotFoundError");
      expect(error.message).toBe(
        'Provider not found for token "MyService" in module "TestModule" or its imports.',
      );
    });

    it("should include both token and module name", () => {
      const error = new ProviderNotFoundError("ServiceToken", "AppModule");

      expect(error.message).toContain("ServiceToken");
      expect(error.message).toContain("AppModule");
    });

    it("should be throwable and catchable", () => {
      expect(() => {
        throw new ProviderNotFoundError("Token", "Module");
      }).toThrow(ProviderNotFoundError);
    });
  });

  describe("ModuleDecoratorMissingError", () => {
    it("should create error with correct message", () => {
      const error = new ModuleDecoratorMissingError("TestModule");

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("ModuleDecoratorMissingError");
      expect(error.message).toBe(
        "Module TestModule does not have the @RgModule decorator",
      );
    });

    it("should indicate missing decorator", () => {
      const error = new ModuleDecoratorMissingError("MyModule");

      expect(error.message).toContain("@RgModule");
      expect(error.message).toContain("MyModule");
    });
  });

  describe("InvalidProviderError", () => {
    it("should create error with correct message", () => {
      const error = new InvalidProviderError("TestModule");

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("InvalidProviderError");
      expect(error.message).toBe(
        "Invalid provider definition registered in module TestModule",
      );
    });

    it("should include module name", () => {
      const error = new InvalidProviderError("AppModule");

      expect(error.message).toContain("AppModule");
    });
  });

  describe("SettingsNotInitializedError", () => {
    it("should create error with correct message", () => {
      const error = new SettingsNotInitializedError();

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("SettingsNotInitializedError");
      expect(error.message).toBe(
        "App settings cache has not been initialized.",
      );
    });

    it("should not require parameters", () => {
      expect(() => new SettingsNotInitializedError()).not.toThrow();
    });

    it("should be throwable", () => {
      expect(() => {
        throw new SettingsNotInitializedError();
      }).toThrow(SettingsNotInitializedError);
    });
  });

  describe("Error inheritance", () => {
    it("all custom errors should extend Error", () => {
      expect(new ModuleNotRegisteredError("test")).toBeInstanceOf(Error);
      expect(new ProviderNotFoundError("t", "m")).toBeInstanceOf(Error);
      expect(new ModuleDecoratorMissingError("test")).toBeInstanceOf(Error);
      expect(new InvalidProviderError("test")).toBeInstanceOf(Error);
      expect(new SettingsNotInitializedError()).toBeInstanceOf(Error);
    });

    it("errors should have correct error names", () => {
      const errors = [
        new ModuleNotRegisteredError("test"),
        new ProviderNotFoundError("t", "m"),
        new ModuleDecoratorMissingError("test"),
        new InvalidProviderError("test"),
        new SettingsNotInitializedError(),
      ];

      errors.forEach((error) => {
        expect(error.name).toBeTruthy();
        expect(error.name).not.toBe("Error");
      });
    });
  });
});
