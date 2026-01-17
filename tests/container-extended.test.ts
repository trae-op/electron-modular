import { describe, expect, it, beforeEach } from "vitest";
import { Container } from "../src/@core/container.js";
import {
  ModuleNotRegisteredError,
  ProviderNotFoundError,
} from "../src/@core/errors/index.js";

class TestModule {}
class OtherModule {}

class ServiceA {
  value = "service-a";
}

class ServiceB {
  constructor(public serviceA: ServiceA) {}
}

class ServiceC {
  constructor(
    public serviceA: ServiceA,
    public serviceB: ServiceB,
  ) {}
}

describe("Container - Comprehensive Tests", () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  describe("Module Management", () => {
    it("should add a module successfully", () => {
      const result = container.addModule(TestModule, {
        providers: [],
        exports: [],
      });

      expect(result).toBe(true);
      expect(container.hasModule(TestModule)).toBe(true);
    });

    it("should not add duplicate modules", () => {
      container.addModule(TestModule, { providers: [], exports: [] });
      const result = container.addModule(TestModule, {
        providers: [],
        exports: [],
      });

      expect(result).toBe(false);
    });

    it("should check if module exists", () => {
      expect(container.hasModule(TestModule)).toBe(false);

      container.addModule(TestModule, { providers: [], exports: [] });

      expect(container.hasModule(TestModule)).toBe(true);
    });

    it("should store and retrieve module metadata", () => {
      const metadata = {
        providers: [ServiceA],
        exports: [ServiceA],
        imports: [OtherModule],
      };

      container.addModule(TestModule, metadata);
      container.setModuleMetadata(TestModule, metadata);

      const retrieved = container.getModuleMetadata(TestModule);
      expect(retrieved).toEqual(metadata);
    });

    it("should handle module exports", () => {
      container.addModule(TestModule, {
        providers: [ServiceA, ServiceB],
        exports: [ServiceA],
      });

      const exports = container.getModuleExports(TestModule);
      expect(exports.has(ServiceA)).toBe(true);
      expect(exports.has(ServiceB)).toBe(false);
    });

    it("should return empty set for non-existent module exports", () => {
      const exports = container.getModuleExports(TestModule);
      expect(exports.size).toBe(0);
    });
  });

  describe("Provider Management", () => {
    beforeEach(() => {
      container.addModule(TestModule, { providers: [], exports: [] });
    });

    it("should add class provider", () => {
      container.addProvider(TestModule, ServiceA);

      const provider = container.getProvider(TestModule, ServiceA);
      expect(provider).toBe(ServiceA);
    });

    it("should add provider with instance", () => {
      const instance = { value: "custom" };
      container.addProvider(TestModule, "custom-token", instance);

      const provider = container.getProvider(TestModule, "custom-token");
      expect(provider).toEqual(instance);
    });

    it("should throw when adding provider to non-existent module", () => {
      expect(() => {
        container.addProvider(OtherModule, ServiceA);
      }).toThrow(ModuleNotRegisteredError);
    });

    it("should return undefined for non-existent provider", () => {
      const provider = container.getProvider(TestModule, ServiceA);
      expect(provider).toBeUndefined();
    });

    it("should handle multiple providers in same module", () => {
      container.addProvider(TestModule, ServiceA);
      container.addProvider(TestModule, ServiceB);

      expect(container.getProvider(TestModule, ServiceA)).toBe(ServiceA);
      expect(container.getProvider(TestModule, ServiceB)).toBe(ServiceB);
    });
  });

  describe("Instance Registration", () => {
    it("should register and retrieve instances", async () => {
      const instance = new ServiceA();
      container.registerInstance(ServiceA, instance);

      // Instance should be retrievable in resolve
      container.addModule(TestModule, { providers: [], exports: [] });
      const resolved = await container.resolve(TestModule, ServiceA);

      expect(resolved).toBe(instance);
    });

    it("should handle string tokens", async () => {
      const value = { data: "test" };
      container.registerInstance("test-token", value);

      container.addModule(TestModule, { providers: [], exports: [] });
      const resolved = await container.resolve(TestModule, "test-token");

      expect(resolved).toBe(value);
    });

    it("should handle symbol tokens", async () => {
      const token = Symbol("test");
      const value = { data: "symbol-test" };
      container.registerInstance(token, value);

      container.addModule(TestModule, { providers: [], exports: [] });
      const resolved = await container.resolve(TestModule, token);

      expect(resolved).toBe(value);
    });
  });

  describe("Resolution - Basic Cases", () => {
    beforeEach(() => {
      container.addModule(TestModule, { providers: [], exports: [] });
      container.setModuleMetadata(TestModule, { providers: [], exports: [] });
    });

    it("should resolve simple class provider", async () => {
      container.addProvider(TestModule, ServiceA);

      const instance = await container.resolve<ServiceA>(TestModule, ServiceA);

      expect(instance).toBeInstanceOf(ServiceA);
      expect(instance?.value).toBe("service-a");
    });

    it("should cache resolved instances", async () => {
      container.addProvider(TestModule, ServiceA);

      const instance1 = await container.resolve(TestModule, ServiceA);
      const instance2 = await container.resolve(TestModule, ServiceA);

      expect(instance1).toBe(instance2); // Same reference
    });

    it("should resolve class with dependencies", async () => {
      container.addProvider(TestModule, ServiceA);
      container.addProvider(TestModule, ServiceB, {
        provide: ServiceB,
        useClass: ServiceB,
        inject: [ServiceA],
      });

      const instance = await container.resolve<ServiceB>(TestModule, ServiceB);

      expect(instance).toBeInstanceOf(ServiceB);
      expect(instance?.serviceA).toBeInstanceOf(ServiceA);
    });

    it("should throw when provider not found", async () => {
      await expect(container.resolve(TestModule, ServiceA)).rejects.toThrow(
        ProviderNotFoundError,
      );
    });

    it("should return undefined for module token when not found", async () => {
      const result = await container.resolve(TestModule, TestModule);
      expect(result).toBeUndefined();
    });
  });

  describe("Provider Types - Class Provider", () => {
    beforeEach(() => {
      container.addModule(TestModule, { providers: [], exports: [] });
      container.setModuleMetadata(TestModule, { providers: [], exports: [] });
    });

    it("should resolve class provider with inject array", async () => {
      container.addProvider(TestModule, ServiceA);
      container.addProvider(TestModule, ServiceB, {
        provide: ServiceB,
        useClass: ServiceB,
        inject: [ServiceA],
      });

      const instance = await container.resolve<ServiceB>(TestModule, ServiceB);

      expect(instance).toBeInstanceOf(ServiceB);
      expect(instance?.serviceA).toBeInstanceOf(ServiceA);
      expect(instance?.serviceA.value).toBe("service-a");
    });

    it("should resolve class provider with nested dependencies", async () => {
      container.addProvider(TestModule, ServiceA);
      container.addProvider(TestModule, ServiceB, {
        provide: ServiceB,
        useClass: ServiceB,
        inject: [ServiceA],
      });
      container.addProvider(TestModule, ServiceC, {
        provide: ServiceC,
        useClass: ServiceC,
        inject: [ServiceA, ServiceB],
      });

      const instance = await container.resolve<ServiceC>(TestModule, ServiceC);

      expect(instance).toBeInstanceOf(ServiceC);
      expect(instance?.serviceA).toBeInstanceOf(ServiceA);
      expect(instance?.serviceB).toBeInstanceOf(ServiceB);
    });
  });

  describe("Provider Types - Factory Provider", () => {
    beforeEach(() => {
      container.addModule(TestModule, { providers: [], exports: [] });
      container.setModuleMetadata(TestModule, { providers: [], exports: [] });
    });

    it("should resolve factory provider", async () => {
      container.addProvider(TestModule, "config", {
        provide: "config",
        useFactory: () => ({ apiUrl: "https://api.example.com" }),
      });

      const config = await container.resolve<{ apiUrl: string }>(
        TestModule,
        "config",
      );

      expect(config?.apiUrl).toBe("https://api.example.com");
    });

    it("should resolve factory with dependencies", async () => {
      container.addProvider(TestModule, ServiceA);
      container.addProvider(TestModule, "factory-result", {
        provide: "factory-result",
        useFactory: (serviceA: ServiceA) => ({
          value: serviceA.value + "-factory",
        }),
        inject: [ServiceA],
      });

      const result = await container.resolve<{ value: string }>(
        TestModule,
        "factory-result",
      );

      expect(result?.value).toBe("service-a-factory");
    });

    it("should cache factory results", async () => {
      let callCount = 0;
      container.addProvider(TestModule, "factory", {
        provide: "factory",
        useFactory: () => {
          callCount++;
          return { count: callCount };
        },
      });

      const result1 = await container.resolve(TestModule, "factory");
      const result2 = await container.resolve(TestModule, "factory");

      expect(callCount).toBe(1); // Factory called only once
      expect(result1).toBe(result2);
    });
  });

  describe("Provider Types - Value Provider", () => {
    beforeEach(() => {
      container.addModule(TestModule, { providers: [], exports: [] });
      container.setModuleMetadata(TestModule, { providers: [], exports: [] });
    });

    it("should resolve value provider", async () => {
      const config = { apiKey: "secret-key", timeout: 5000 };
      container.addProvider(TestModule, "config", {
        provide: "config",
        useValue: config,
      });

      const resolved = await container.resolve(TestModule, "config");

      expect(resolved).toBe(config);
    });

    it("should handle primitive values", async () => {
      container.addProvider(TestModule, "port", {
        provide: "port",
        useValue: 3000,
      });

      const port = await container.resolve<number>(TestModule, "port");

      expect(port).toBe(3000);
    });

    it("should handle null and undefined values", async () => {
      container.addProvider(TestModule, "null-value", {
        provide: "null-value",
        useValue: null,
      });

      container.addProvider(TestModule, "undefined-value", {
        provide: "undefined-value",
        useValue: undefined,
      });

      const nullValue = await container.resolve(TestModule, "null-value");
      const undefinedValue = await container.resolve(
        TestModule,
        "undefined-value",
      );

      expect(nullValue).toBeNull();
      expect(undefinedValue).toBeUndefined();
    });
  });

  describe("Provider Types - Existing Provider", () => {
    beforeEach(() => {
      container.addModule(TestModule, { providers: [], exports: [] });
      container.setModuleMetadata(TestModule, { providers: [], exports: [] });
    });

    it("should resolve existing provider (alias)", async () => {
      container.addProvider(TestModule, ServiceA);
      container.addProvider(TestModule, "service-alias", {
        provide: "service-alias",
        useExisting: ServiceA,
      });

      const original = await container.resolve(TestModule, ServiceA);
      const alias = await container.resolve(TestModule, "service-alias");

      expect(alias).toBe(original);
    });

    it("should create multiple aliases", async () => {
      container.addProvider(TestModule, ServiceA);
      container.addProvider(TestModule, "alias1", {
        provide: "alias1",
        useExisting: ServiceA,
      });
      container.addProvider(TestModule, "alias2", {
        provide: "alias2",
        useExisting: ServiceA,
      });

      const original = await container.resolve(TestModule, ServiceA);
      const alias1 = await container.resolve(TestModule, "alias1");
      const alias2 = await container.resolve(TestModule, "alias2");

      expect(alias1).toBe(original);
      expect(alias2).toBe(original);
    });
  });

  describe("Module Imports", () => {
    it("should resolve from imported module", async () => {
      // Setup OtherModule with exported ServiceA
      container.addModule(OtherModule, {
        providers: [ServiceA],
        exports: [ServiceA],
      });
      container.addProvider(OtherModule, ServiceA);

      // Setup TestModule importing OtherModule
      container.addModule(TestModule, {
        providers: [],
        exports: [],
      });
      container.setModuleMetadata(TestModule, {
        imports: [OtherModule],
        providers: [],
        exports: [],
      });

      const instance = await container.resolve<ServiceA>(TestModule, ServiceA);

      expect(instance).toBeInstanceOf(ServiceA);
    });

    it("should not resolve non-exported providers from imports", async () => {
      // ServiceB is provided but not exported
      container.addModule(OtherModule, {
        providers: [ServiceB],
        exports: [], // Not exported
      });
      container.addProvider(OtherModule, ServiceB);

      container.addModule(TestModule, {
        providers: [],
        exports: [],
      });
      container.setModuleMetadata(TestModule, {
        imports: [OtherModule],
        providers: [],
        exports: [],
      });

      await expect(container.resolve(TestModule, ServiceB)).rejects.toThrow(
        ProviderNotFoundError,
      );
    });

    it("should resolve from multiple imports", async () => {
      class ThirdModule {}

      container.addModule(OtherModule, {
        providers: [ServiceA],
        exports: [ServiceA],
      });
      container.addProvider(OtherModule, ServiceA);

      container.addModule(ThirdModule, {
        providers: [ServiceB],
        exports: [ServiceB],
      });
      container.addProvider(ThirdModule, ServiceB);

      container.addModule(TestModule, {
        providers: [],
        exports: [],
      });
      container.setModuleMetadata(TestModule, {
        imports: [OtherModule, ThirdModule],
        providers: [],
        exports: [],
      });

      const serviceA = await container.resolve(TestModule, ServiceA);
      const serviceB = await container.resolve(TestModule, ServiceB);

      expect(serviceA).toBeInstanceOf(ServiceA);
      expect(serviceB).toBeInstanceOf(ServiceB);
    });
  });

  describe("Cache Behavior", () => {
    beforeEach(() => {
      container.addModule(TestModule, { providers: [], exports: [] });
    });

    it("should use resolution cache", async () => {
      let instantiationCount = 0;

      class CountedService {
        constructor() {
          instantiationCount++;
        }
      }

      container.addProvider(TestModule, CountedService);

      await container.resolve(TestModule, CountedService);
      await container.resolve(TestModule, CountedService);
      await container.resolve(TestModule, CountedService);

      expect(instantiationCount).toBe(1);
    });

    it("should cache resolved instances from imports", async () => {
      let instantiationCount = 0;

      class CountedService {
        constructor() {
          instantiationCount++;
        }
      }

      container.addModule(OtherModule, {
        providers: [CountedService],
        exports: [CountedService],
      });
      container.setModuleMetadata(OtherModule, {
        providers: [CountedService],
        exports: [CountedService],
      });
      container.addProvider(OtherModule, CountedService);

      container.setModuleMetadata(TestModule, {
        imports: [OtherModule],
        providers: [],
        exports: [],
      });

      await container.resolve(TestModule, CountedService);
      await container.resolve(TestModule, CountedService);

      expect(instantiationCount).toBe(1);
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle circular-free dependency graphs", async () => {
      // A <- B <- C
      class A {}
      class B {
        constructor(public a: A) {}
      }
      class C {
        constructor(public b: B) {}
      }

      container.addModule(TestModule, {
        providers: [A, B, C],
        exports: [],
      });
      container.setModuleMetadata(TestModule, {
        providers: [A, B, C],
        exports: [],
      });

      container.addProvider(TestModule, A);
      container.addProvider(TestModule, B, {
        provide: B,
        useClass: B,
        inject: [A],
      });
      container.addProvider(TestModule, C, {
        provide: C,
        useClass: C,
        inject: [B],
      });

      const c = await container.resolve<C>(TestModule, C);

      expect(c).toBeInstanceOf(C);
      expect(c?.b).toBeInstanceOf(B);
      expect(c?.b.a).toBeInstanceOf(A);
    });

    it("should handle mixed provider types in dependencies", async () => {
      const CONFIG_VALUE = { env: "test" };

      class DatabaseService {
        constructor(public config: typeof CONFIG_VALUE) {}
      }

      container.addModule(TestModule, { providers: [], exports: [] });
      container.setModuleMetadata(TestModule, { providers: [], exports: [] });

      container.addProvider(TestModule, "config", {
        provide: "config",
        useValue: CONFIG_VALUE,
      });

      container.addProvider(TestModule, DatabaseService, {
        provide: DatabaseService,
        useClass: DatabaseService,
        inject: ["config"],
      });

      const db = await container.resolve<DatabaseService>(
        TestModule,
        DatabaseService,
      );

      expect(db?.config).toBe(CONFIG_VALUE);
    });
  });
});
