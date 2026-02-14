import { describe, it, expect, vi, beforeEach } from "vitest";
import { bootstrapModules } from "../bootstrap.js";
import { RgModule } from "../../decorators/rg-module.js";
import {
  DuplicateLazyTriggerError,
  EagerModuleCannotImportLazyModuleError,
  InvalidLazyTriggerError,
  LazyModuleCannotImportLazyModuleError,
  LazyModuleExportsNotAllowedError,
  ModuleDecoratorMissingError,
} from "../../errors/index.js";
import { container } from "../../container.js";
import "reflect-metadata/lite";

describe("bootstrapModules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw error for module without @RgModule decorator", async () => {
    class UnDecoratedModule {}

    await expect(bootstrapModules([UnDecoratedModule])).rejects.toThrow(
      ModuleDecoratorMissingError,
    );
  });

  it("should bootstrap single module", async () => {
    @RgModule({
      providers: [],
    })
    class TestModule {}

    await bootstrapModules([TestModule]);

    expect(container.hasModule(TestModule)).toBe(true);
  });

  it("should bootstrap multiple modules", async () => {
    @RgModule({
      providers: [],
    })
    class Module1 {}

    @RgModule({
      providers: [],
    })
    class Module2 {}

    await bootstrapModules([Module1, Module2]);

    expect(container.hasModule(Module1)).toBe(true);
    expect(container.hasModule(Module2)).toBe(true);
  });

  it("should handle module with providers", async () => {
    class Service {
      value = "test";
    }

    @RgModule({
      providers: [Service],
    })
    class TestModule {}

    await bootstrapModules([TestModule]);

    const service = await container.resolve(TestModule, Service);
    expect(service).toBeInstanceOf(Service);
  });

  it("should handle module with imports", async () => {
    @RgModule({
      providers: [],
    })
    class ImportedModule {}

    @RgModule({
      imports: [ImportedModule],
      providers: [],
    })
    class MainModule {}

    await bootstrapModules([MainModule]);

    expect(container.hasModule(MainModule)).toBe(true);
    expect(container.hasModule(ImportedModule)).toBe(true);
  });

  it("should handle empty modules array", async () => {
    await expect(bootstrapModules([])).resolves.toBeUndefined();
  });

  it("should process modules in order", async () => {
    const initOrder: string[] = [];

    @RgModule({
      providers: [],
    })
    class Module1 {
      constructor() {
        initOrder.push("Module1");
      }
    }

    @RgModule({
      providers: [],
    })
    class Module2 {
      constructor() {
        initOrder.push("Module2");
      }
    }

    @RgModule({
      providers: [],
    })
    class Module3 {
      constructor() {
        initOrder.push("Module3");
      }
    }

    await bootstrapModules([Module1, Module2, Module3]);

    expect(initOrder).toEqual(["Module1", "Module2", "Module3"]);
  });

  it("should throw InvalidLazyTriggerError for empty lazy trigger", async () => {
    @RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "   " },
    })
    class InvalidLazyModule {}

    await expect(bootstrapModules([InvalidLazyModule])).rejects.toThrow(
      InvalidLazyTriggerError,
    );
  });

  it("should throw DuplicateLazyTriggerError for duplicate lazy triggers", async () => {
    @RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "analytics" },
    })
    class LazyModuleA {}

    @RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "analytics" },
    })
    class LazyModuleB {}

    await expect(bootstrapModules([LazyModuleA, LazyModuleB])).rejects.toThrow(
      DuplicateLazyTriggerError,
    );
  });

  it("should throw LazyModuleExportsNotAllowedError when lazy module declares exports", async () => {
    class ExportedService {}

    @RgModule({
      providers: [ExportedService],
      exports: [ExportedService],
      lazy: { enabled: true, trigger: "analytics" },
    })
    class InvalidLazyExportsModule {}

    await expect(bootstrapModules([InvalidLazyExportsModule])).rejects.toThrow(
      LazyModuleExportsNotAllowedError,
    );
  });

  it("should throw LazyModuleCannotImportLazyModuleError when lazy module imports lazy module", async () => {
    @RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "database" },
    })
    class DatabaseModule {}

    @RgModule({
      imports: [DatabaseModule],
      providers: [],
      lazy: { enabled: true, trigger: "analytics" },
    })
    class AnalyticsModule {}

    await expect(bootstrapModules([AnalyticsModule])).rejects.toThrow(
      LazyModuleCannotImportLazyModuleError,
    );
  });

  it("should throw EagerModuleCannotImportLazyModuleError when eager module imports lazy module", async () => {
    @RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "database" },
    })
    class DatabaseModule {}

    @RgModule({
      imports: [DatabaseModule],
      providers: [],
    })
    class EagerAnalyticsModule {}

    await expect(bootstrapModules([EagerAnalyticsModule])).rejects.toThrow(
      EagerModuleCannotImportLazyModuleError,
    );
  });
});
