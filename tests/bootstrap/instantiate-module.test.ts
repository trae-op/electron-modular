import { describe, expect, it, beforeEach, vi } from "vitest";
import { instantiateModule } from "../../src/@core/bootstrap/instantiate-module.js";
import { container } from "../../src/@core/container.js";
import { Inject } from "../../src/@core/decorators/inject.js";

describe("instantiateModule", () => {
  beforeEach(() => {
    // Note: Using global container, tests should be isolated enough
  });

  it("should instantiate module without dependencies", async () => {
    class SimpleModule {
      value = "initialized";
    }

    container.addModule(SimpleModule, { providers: [], exports: [] });

    const instance = await instantiateModule(SimpleModule);

    expect(instance).toBeInstanceOf(SimpleModule);
    expect((instance as SimpleModule).value).toBe("initialized");
  });

  it("should register instantiated module in container", async () => {
    class TestModule {}

    container.addModule(TestModule, { providers: [], exports: [] });

    const registerSpy = vi.spyOn(container, "registerInstance");

    await instantiateModule(TestModule);

    expect(registerSpy).toHaveBeenCalledWith(
      TestModule,
      expect.any(TestModule),
    );
  });

  it("should resolve dependencies before instantiation", async () => {
    class DependencyA {
      value = "dep-a";
    }

    class ModuleWithDeps {
      constructor(@Inject(DependencyA) public depA: DependencyA) {}
    }

    container.addModule(ModuleWithDeps, {
      providers: [DependencyA],
      exports: [],
    });
    container.addProvider(ModuleWithDeps, DependencyA);

    const instance = (await instantiateModule(
      ModuleWithDeps,
    )) as ModuleWithDeps;

    expect(instance).toBeInstanceOf(ModuleWithDeps);
    expect(instance.depA).toBeInstanceOf(DependencyA);
    expect(instance.depA.value).toBe("dep-a");
  });

  it("should handle multiple dependencies", async () => {
    class ServiceA {
      name = "service-a";
    }

    class ServiceB {
      name = "service-b";
    }

    class ModuleWithMultipleDeps {
      constructor(
        @Inject(ServiceA) public serviceA: ServiceA,
        @Inject(ServiceB) public serviceB: ServiceB,
      ) {}
    }

    container.addModule(ModuleWithMultipleDeps, { providers: [], exports: [] });
    container.addProvider(ModuleWithMultipleDeps, ServiceA);
    container.addProvider(ModuleWithMultipleDeps, ServiceB);

    const instance = (await instantiateModule(
      ModuleWithMultipleDeps,
    )) as ModuleWithMultipleDeps;

    expect(instance.serviceA).toBeInstanceOf(ServiceA);
    expect(instance.serviceB).toBeInstanceOf(ServiceB);
    expect(instance.serviceA.name).toBe("service-a");
    expect(instance.serviceB.name).toBe("service-b");
  });

  it("should work with @Inject decorator", async () => {
    const CONFIG_TOKEN = "config";
    const config = { apiUrl: "https://api.example.com" };

    class ModuleWithInjectedDep {
      constructor(@Inject(CONFIG_TOKEN) public config: any) {}
    }

    container.addModule(ModuleWithInjectedDep, { providers: [], exports: [] });
    container.registerInstance(CONFIG_TOKEN, config);

    const instance = (await instantiateModule(
      ModuleWithInjectedDep,
    )) as ModuleWithInjectedDep;

    expect(instance.config).toBe(config);
  });

  it("should handle nested dependencies", async () => {
    class ServiceA {}

    class ServiceB {
      constructor(@Inject(ServiceA) public serviceA: ServiceA) {}
    }

    class ModuleWithNestedDeps {
      constructor(@Inject(ServiceB) public serviceB: ServiceB) {}
    }

    container.addModule(ModuleWithNestedDeps, { providers: [], exports: [] });
    container.addProvider(ModuleWithNestedDeps, ServiceA);
    container.addProvider(ModuleWithNestedDeps, ServiceB, {
      provide: ServiceB,
      useClass: ServiceB,
      inject: [ServiceA],
    });

    const instance = (await instantiateModule(
      ModuleWithNestedDeps,
    )) as ModuleWithNestedDeps;

    expect(instance.serviceB).toBeInstanceOf(ServiceB);
    expect(instance.serviceB.serviceA).toBeInstanceOf(ServiceA);
  });

  it("should call constructor with resolved dependencies", async () => {
    let constructorCalled = false;
    let receivedDep: any = null;

    class Dependency {
      value = "test-dep";
    }

    class TestModule {
      constructor(@Inject(Dependency) dep: Dependency) {
        constructorCalled = true;
        receivedDep = dep;
      }
    }

    container.addModule(TestModule, { providers: [], exports: [] });
    container.addProvider(TestModule, Dependency);

    await instantiateModule(TestModule);

    expect(constructorCalled).toBe(true);
    expect(receivedDep).toBeInstanceOf(Dependency);
    expect(receivedDep.value).toBe("test-dep");
  });

  it("should return the instance", async () => {
    class MyModule {
      getId() {
        return "module-123";
      }
    }

    container.addModule(MyModule, { providers: [], exports: [] });

    const instance = (await instantiateModule(MyModule)) as MyModule;

    expect(typeof instance.getId).toBe("function");
    expect(instance.getId()).toBe("module-123");
  });

  it("should handle module with no constructor parameters", async () => {
    class EmptyModule {}

    container.addModule(EmptyModule, { providers: [], exports: [] });

    const instance = await instantiateModule(EmptyModule);

    expect(instance).toBeInstanceOf(EmptyModule);
  });
});
