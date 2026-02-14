import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerImports } from "../register-imports.js";
import { RgModule } from "../../decorators/rg-module.js";
import { container } from "../../container.js";
import { EagerModuleCannotImportLazyModuleError } from "../../errors/index.js";
import "reflect-metadata/lite";

describe("registerImports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return early if no imports in metadata", async () => {
    class HostModule {}

    const metadata = {};

    await expect(
      registerImports(HostModule, metadata),
    ).resolves.toBeUndefined();
  });

  it("should initialize imported module", async () => {
    @RgModule({
      providers: [],
    })
    class ImportedModule {}

    const metadata = {
      imports: [ImportedModule],
    };

    await registerImports(class HostModule {}, metadata);

    expect(container.hasModule(ImportedModule)).toBe(true);
  });

  it("should initialize multiple imported modules", async () => {
    @RgModule({
      providers: [],
    })
    class Module1 {}

    @RgModule({
      providers: [],
    })
    class Module2 {}

    const metadata = {
      imports: [Module1, Module2],
    };

    await registerImports(class HostModule {}, metadata);

    expect(container.hasModule(Module1)).toBe(true);
    expect(container.hasModule(Module2)).toBe(true);
  });

  it("should handle empty imports array", async () => {
    const metadata = {
      imports: [],
    };

    await expect(
      registerImports(class HostModule {}, metadata),
    ).resolves.toBeUndefined();
  });

  it("should skip module without @RgModule decorator", async () => {
    class NonDecoratedModule {}

    const metadata = {
      imports: [NonDecoratedModule],
    };

    // Should not throw, just skip initialization
    await expect(
      registerImports(class HostModule {}, metadata),
    ).resolves.toBeUndefined();
  });

  it("should initialize nested imports", async () => {
    @RgModule({
      providers: [],
    })
    class NestedModule {}

    @RgModule({
      imports: [NestedModule],
      providers: [],
    })
    class ParentModule {}

    const metadata = {
      imports: [ParentModule],
    };

    await registerImports(class HostModule {}, metadata);

    expect(container.hasModule(ParentModule)).toBe(true);
    expect(container.hasModule(NestedModule)).toBe(true);
  });

  it("should handle module with providers", async () => {
    class Service {}

    @RgModule({
      providers: [Service],
    })
    class ModuleWithProviders {}

    const metadata = {
      imports: [ModuleWithProviders],
    };

    await registerImports(class HostModule {}, metadata);

    expect(container.hasModule(ModuleWithProviders)).toBe(true);
    const provider = container.getProvider(ModuleWithProviders, Service);
    expect(provider).toBe(Service);
  });

  it("should throw when eager module imports lazy module", async () => {
    @RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "db" },
    })
    class LazyModule {}

    class EagerModule {}

    const metadata = {
      imports: [LazyModule],
      providers: [],
    };

    await expect(registerImports(EagerModule, metadata)).rejects.toThrow(
      EagerModuleCannotImportLazyModuleError,
    );
  });
});
