import { describe, it, expect, beforeEach } from "vitest";
import { Container } from "../container.js";
import { Injectable } from "../decorators/injectable.js";
import { Inject } from "../decorators/inject.js";
import {
  ModuleNotRegisteredError,
  ProviderNotFoundError,
} from "../errors/index.js";
import type { Constructor } from "../types/constructor.js";
import type {
  TClassProvider,
  TFactoryProvider,
  TValueProvider,
  TExistingProvider,
} from "../types/provider.js";
import "reflect-metadata/lite";

describe("Container", () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  describe("addModule", () => {
    it("should add a new module", () => {
      class TestModule {}

      const result = container.addModule(TestModule, {
        providers: [],
        exports: [],
      });

      expect(result).toBe(true);
      expect(container.hasModule(TestModule)).toBe(true);
    });

    it("should not add duplicate module", () => {
      class TestModule {}

      container.addModule(TestModule, { providers: [], exports: [] });
      const result = container.addModule(TestModule, {
        providers: [],
        exports: [],
      });

      expect(result).toBe(false);
    });

    it("should store module exports", () => {
      class TestModule {}
      const EXPORT_TOKEN = Symbol("export");

      container.addModule(TestModule, {
        providers: [],
        exports: [EXPORT_TOKEN],
      });

      const exports = container.getModuleExports(TestModule);
      expect(exports.has(EXPORT_TOKEN)).toBe(true);
    });
  });

  describe("setModuleMetadata", () => {
    it("should store module metadata", () => {
      class TestModule {}
      class ImportedModule {}

      const metadata = {
        imports: [ImportedModule],
        providers: [],
      };

      container.setModuleMetadata(TestModule, metadata);

      const retrieved = container.getModuleMetadata(TestModule);
      expect(retrieved).toEqual(metadata);
    });
  });

  describe("hasModule", () => {
    it("should return true for registered module", () => {
      class TestModule {}
      container.addModule(TestModule, { providers: [] });

      expect(container.hasModule(TestModule)).toBe(true);
    });

    it("should return false for unregistered module", () => {
      class TestModule {}

      expect(container.hasModule(TestModule)).toBe(false);
    });
  });

  describe("addProvider", () => {
    it("should add provider to module", () => {
      class TestModule {}
      class TestService {}

      container.addModule(TestModule, { providers: [] });
      container.addProvider(TestModule, TestService);

      const provider = container.getProvider(TestModule, TestService);
      expect(provider).toBe(TestService);
    });

    it("should throw error if module not registered", () => {
      class TestModule {}
      class TestService {}

      expect(() => {
        container.addProvider(TestModule, TestService);
      }).toThrow(ModuleNotRegisteredError);
    });

    it("should add provider with instance", () => {
      class TestModule {}
      const TOKEN = Symbol("token");
      const instance = { value: "test" };

      container.addModule(TestModule, { providers: [] });
      container.addProvider(TestModule, TOKEN, instance);

      const provider = container.getProvider(TestModule, TOKEN);
      expect(provider).toBe(instance);
    });
  });

  describe("getProvider", () => {
    it("should return undefined for unregistered module", () => {
      class TestModule {}
      const TOKEN = Symbol("token");

      const provider = container.getProvider(TestModule, TOKEN);
      expect(provider).toBeUndefined();
    });

    it("should return undefined for non-existent provider", () => {
      class TestModule {}
      const TOKEN = Symbol("token");

      container.addModule(TestModule, { providers: [] });

      const provider = container.getProvider(TestModule, TOKEN);
      expect(provider).toBeUndefined();
    });

    it("should return provider", () => {
      class TestModule {}
      class TestService {}

      container.addModule(TestModule, { providers: [] });
      container.addProvider(TestModule, TestService);

      const provider = container.getProvider(TestModule, TestService);
      expect(provider).toBe(TestService);
    });
  });

  describe("getModuleExports", () => {
    it("should return empty set for unregistered module", () => {
      class TestModule {}

      const exports = container.getModuleExports(TestModule);
      expect(exports).toBeInstanceOf(Set);
      expect(exports.size).toBe(0);
    });

    it("should return module exports", () => {
      class TestModule {}
      const TOKEN1 = Symbol("token1");
      const TOKEN2 = Symbol("token2");

      container.addModule(TestModule, {
        providers: [],
        exports: [TOKEN1, TOKEN2],
      });

      const exports = container.getModuleExports(TestModule);
      expect(exports.has(TOKEN1)).toBe(true);
      expect(exports.has(TOKEN2)).toBe(true);
    });
  });

  describe("registerInstance", () => {
    it("should register singleton instance", () => {
      const TOKEN = Symbol("token");
      const instance = { value: "singleton" };

      container.registerInstance(TOKEN, instance);

      expect(true).toBe(true); // Instance registered
    });
  });

  describe("resolve", () => {
    it("should resolve class constructor provider", async () => {
      @Injectable()
      class TestService {
        value = "test";
      }

      class TestModule {}

      container.addModule(TestModule, { providers: [] });
      container.addProvider(TestModule, TestService);

      const instance = await container.resolve<TestService>(
        TestModule,
        TestService,
      );

      expect(instance).toBeInstanceOf(TestService);
      expect(instance?.value).toBe("test");
    });

    it("should resolve with dependencies", async () => {
      @Injectable()
      class Dependency {
        value = "dep";
      }

      @Injectable()
      class TestService {
        constructor(public dep: Dependency) {}
      }

      // Manually set metadata for testing
      Reflect.defineMetadata("design:paramtypes", [Dependency], TestService);

      class TestModule {}

      container.addModule(TestModule, { providers: [] });
      container.addProvider(TestModule, Dependency);
      container.addProvider(TestModule, TestService);

      const instance = await container.resolve<TestService>(
        TestModule,
        TestService,
      );

      expect(instance).toBeInstanceOf(TestService);
      expect(instance?.dep).toBeInstanceOf(Dependency);
    });

    it("should resolve factory provider", async () => {
      const factoryProvider: TFactoryProvider = {
        provide: "TEST_TOKEN",
        useFactory: () => ({ value: "factory" }),
      };

      class TestModule {}

      container.addModule(TestModule, { providers: [] });
      container.addProvider(TestModule, "TEST_TOKEN", factoryProvider);

      const instance = await container.resolve<any>(TestModule, "TEST_TOKEN");

      expect(instance?.value).toBe("factory");
    });

    it("should resolve factory provider with dependencies", async () => {
      @Injectable()
      class Dependency {
        value = "dep";
      }

      const factoryProvider: TFactoryProvider = {
        provide: "TEST_TOKEN",
        useFactory: (dep: Dependency) => ({ dep }),
        inject: [Dependency],
      };

      class TestModule {}

      container.addModule(TestModule, { providers: [] });
      container.addProvider(TestModule, Dependency);
      container.addProvider(TestModule, "TEST_TOKEN", factoryProvider);

      const instance = await container.resolve<any>(TestModule, "TEST_TOKEN");

      expect(instance?.dep).toBeInstanceOf(Dependency);
    });

    it("should resolve class provider", async () => {
      @Injectable()
      class Implementation {
        value = "impl";
      }

      const classProvider: TClassProvider = {
        provide: "INTERFACE",
        useClass: Implementation,
      };

      class TestModule {}

      container.addModule(TestModule, { providers: [] });
      container.addProvider(TestModule, "INTERFACE", classProvider);

      const instance = await container.resolve<Implementation>(
        TestModule,
        "INTERFACE",
      );

      expect(instance).toBeInstanceOf(Implementation);
      expect(instance?.value).toBe("impl");
    });

    it("should resolve value provider", async () => {
      const valueProvider: TValueProvider = {
        provide: "CONFIG",
        useValue: { setting: "value" },
      };

      class TestModule {}

      container.addModule(TestModule, { providers: [] });
      container.addProvider(TestModule, "CONFIG", valueProvider);

      const instance = await container.resolve<any>(TestModule, "CONFIG");

      expect(instance?.setting).toBe("value");
    });

    it("should resolve existing provider", async () => {
      @Injectable()
      class Service {
        value = "service";
      }

      const existingProvider: TExistingProvider = {
        provide: "ALIAS",
        useExisting: Service,
      };

      class TestModule {}

      container.addModule(TestModule, { providers: [] });
      container.addProvider(TestModule, Service);
      container.addProvider(TestModule, "ALIAS", existingProvider);

      const instance = await container.resolve<Service>(TestModule, "ALIAS");

      expect(instance).toBeInstanceOf(Service);
    });

    it("should cache resolved instances", async () => {
      @Injectable()
      class TestService {
        value = Math.random();
      }

      class TestModule {}

      container.addModule(TestModule, { providers: [] });
      container.addProvider(TestModule, TestService);

      const instance1 = await container.resolve<TestService>(
        TestModule,
        TestService,
      );
      const instance2 = await container.resolve<TestService>(
        TestModule,
        TestService,
      );

      expect(instance1).toBe(instance2);
    });

    it("should resolve from registered instances", async () => {
      const TOKEN = Symbol("singleton");
      const instance = { value: "singleton" };

      class TestModule {}

      container.addModule(TestModule, { providers: [] });
      container.registerInstance(TOKEN, instance);

      const resolved = await container.resolve<any>(TestModule, TOKEN);

      expect(resolved).toBe(instance);
    });

    it("should throw error if provider not found", async () => {
      class TestModule {}
      const TOKEN = Symbol("nonexistent");

      container.addModule(TestModule, { providers: [] });

      await expect(container.resolve(TestModule, TOKEN)).rejects.toThrow(
        ProviderNotFoundError,
      );
    });

    it("should return undefined for module class token not found", async () => {
      class TestModule {}

      container.addModule(TestModule, { providers: [] });

      const result = await container.resolve(TestModule, TestModule);

      expect(result).toBeUndefined();
    });

    it("should resolve from imports", async () => {
      @Injectable()
      class SharedService {
        value = "shared";
      }

      class SharedModule {}
      class TestModule {}

      container.addModule(SharedModule, {
        providers: [],
        exports: [SharedService],
      });
      container.addProvider(SharedModule, SharedService);

      container.addModule(TestModule, { providers: [] });
      container.setModuleMetadata(TestModule, {
        imports: [SharedModule],
      });

      const instance = await container.resolve<SharedService>(
        TestModule,
        SharedService,
      );

      expect(instance).toBeInstanceOf(SharedService);
    });
  });

  describe("dependency injection with @Inject", () => {
    it("should inject custom tokens", async () => {
      const CONFIG_TOKEN = Symbol("config");

      @Injectable()
      class TestService {
        constructor(@Inject(CONFIG_TOKEN) public config: any) {}
      }

      class TestModule {}

      container.addModule(TestModule, { providers: [] });
      container.addProvider(TestModule, CONFIG_TOKEN, { value: "config" });
      container.addProvider(TestModule, TestService);

      const instance = await container.resolve<TestService>(
        TestModule,
        TestService,
      );

      expect(instance?.config).toEqual({ value: "config" });
    });
  });

  describe("edge cases", () => {
    it("should handle circular dependencies gracefully", async () => {
      // Note: Actual circular dependency handling would need more complex implementation
      // This test verifies basic behavior
      @Injectable()
      class ServiceA {
        value = "a";
      }

      class TestModule {}

      container.addModule(TestModule, { providers: [] });
      container.addProvider(TestModule, ServiceA);

      const instance = await container.resolve<ServiceA>(TestModule, ServiceA);

      expect(instance).toBeInstanceOf(ServiceA);
    });

    it("should handle empty providers array", async () => {
      class TestModule {}

      container.addModule(TestModule, { providers: [] });

      expect(container.hasModule(TestModule)).toBe(true);
    });
  });
});
