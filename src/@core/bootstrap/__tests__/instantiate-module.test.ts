import { describe, it, expect, beforeEach } from "vitest";
import { instantiateModule } from "../instantiate-module.js";
import { container } from "../../container.js";
import { Injectable } from "../../decorators/injectable.js";
import "reflect-metadata/lite";

describe("instantiateModule", () => {
  beforeEach(() => {
    // Each test will create its own module
  });

  it("should instantiate module with no dependencies", async () => {
    @Injectable()
    class SimpleModule {
      value = "simple";
    }

    container.addModule(SimpleModule, { providers: [] });

    const instance = await instantiateModule(SimpleModule);

    expect(instance).toBeInstanceOf(SimpleModule);
    expect((instance as any).value).toBe("simple");
  });

  it("should instantiate module with dependencies", async () => {
    @Injectable()
    class Dependency {
      value = "dep";
    }

    @Injectable()
    class ModuleWithDeps {
      constructor(public dep: Dependency) {}
    }

    Reflect.defineMetadata("design:paramtypes", [Dependency], ModuleWithDeps);

    container.addModule(ModuleWithDeps, { providers: [] });
    container.addProvider(ModuleWithDeps, Dependency);

    const instance = await instantiateModule(ModuleWithDeps);

    expect(instance).toBeInstanceOf(ModuleWithDeps);
    expect((instance as any).dep).toBeInstanceOf(Dependency);
  });

  it("should register instantiated module in container", async () => {
    @Injectable()
    class TestModule {
      id = Math.random();
    }

    container.addModule(TestModule, { providers: [] });

    const instance1 = await instantiateModule(TestModule);
    const instance2 = await container.resolve(TestModule, TestModule);

    expect(instance1).toBe(instance2);
  });

  it("should resolve multiple dependencies", async () => {
    @Injectable()
    class Dep1 {
      value = "dep1";
    }

    @Injectable()
    class Dep2 {
      value = "dep2";
    }

    @Injectable()
    class ModuleWithMultipleDeps {
      constructor(
        public dep1: Dep1,
        public dep2: Dep2,
      ) {}
    }

    Reflect.defineMetadata(
      "design:paramtypes",
      [Dep1, Dep2],
      ModuleWithMultipleDeps,
    );

    container.addModule(ModuleWithMultipleDeps, { providers: [] });
    container.addProvider(ModuleWithMultipleDeps, Dep1);
    container.addProvider(ModuleWithMultipleDeps, Dep2);

    const instance = await instantiateModule(ModuleWithMultipleDeps);

    expect((instance as any).dep1).toBeInstanceOf(Dep1);
    expect((instance as any).dep2).toBeInstanceOf(Dep2);
  });

  it("should handle module with constructor logic", async () => {
    @Injectable()
    class ModuleWithLogic {
      initialized = false;

      constructor() {
        this.initialized = true;
      }
    }

    container.addModule(ModuleWithLogic, { providers: [] });

    const instance = await instantiateModule(ModuleWithLogic);

    expect((instance as any).initialized).toBe(true);
  });

  it("should pass resolved dependencies to constructor", async () => {
    @Injectable()
    class Config {
      setting = "configured";
    }

    @Injectable()
    class AppModule {
      configValue: string;

      constructor(config: Config) {
        this.configValue = config.setting;
      }
    }

    Reflect.defineMetadata("design:paramtypes", [Config], AppModule);

    container.addModule(AppModule, { providers: [] });
    container.addProvider(AppModule, Config);

    const instance = await instantiateModule(AppModule);

    expect((instance as any).configValue).toBe("configured");
  });

  it("should return the created instance", async () => {
    @Injectable()
    class ReturnTestModule {}

    container.addModule(ReturnTestModule, { providers: [] });

    const result = await instantiateModule(ReturnTestModule);

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(ReturnTestModule);
  });

  it("should handle async dependency resolution", async () => {
    @Injectable()
    class AsyncDep {
      value = "async";
    }

    @Injectable()
    class AsyncModule {
      constructor(public dep: AsyncDep) {}
    }

    Reflect.defineMetadata("design:paramtypes", [AsyncDep], AsyncModule);

    container.addModule(AsyncModule, { providers: [] });
    container.addProvider(AsyncModule, AsyncDep);

    const instance = await instantiateModule(AsyncModule);

    expect(instance).toBeInstanceOf(AsyncModule);
    expect((instance as any).dep.value).toBe("async");
  });
});
