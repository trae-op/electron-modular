import { describe, it, expect, vi, beforeEach } from "vitest";
import { initializeModule } from "../initialize-module.js";
import { container } from "../../container.js";
import { RgModule } from "../../decorators/rg-module.js";
import { Injectable } from "../../decorators/injectable.js";
import { EagerModuleCannotImportLazyModuleError } from "../../errors/index.js";
import type { TParamOnInit } from "../../types/ipc-handler.js";
import "reflect-metadata/lite";

describe("initializeModule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should add module to container", async () => {
    @RgModule({
      providers: [],
    })
    class TestModule {}

    const metadata = Reflect.getMetadata("RgModule", TestModule);

    await initializeModule(TestModule, metadata);

    expect(container.hasModule(TestModule)).toBe(true);
  });

  it("should set module metadata", async () => {
    const metadata = {
      providers: [],
      exports: [],
    };

    @RgModule(metadata)
    class TestModule {}

    await initializeModule(TestModule, metadata);

    const storedMetadata = container.getModuleMetadata(TestModule);
    expect(storedMetadata).toEqual(metadata);
  });

  it("should not re-initialize existing module", async () => {
    @RgModule({
      providers: [],
    })
    class TestModule {}

    const metadata = Reflect.getMetadata("RgModule", TestModule);

    await initializeModule(TestModule, metadata);
    await initializeModule(TestModule, metadata);

    // Should only be added once
    expect(container.hasModule(TestModule)).toBe(true);
  });

  it("should register providers", async () => {
    @Injectable()
    class TestService {}

    @RgModule({
      providers: [TestService],
    })
    class TestModule {}

    const metadata = Reflect.getMetadata("RgModule", TestModule);

    await initializeModule(TestModule, metadata);

    const provider = container.getProvider(TestModule, TestService);
    expect(provider).toBe(TestService);
  });

  it("should register imports", async () => {
    @RgModule({
      providers: [],
    })
    class ImportedModule {}

    @RgModule({
      imports: [ImportedModule],
      providers: [],
    })
    class TestModule {}

    const metadata = Reflect.getMetadata("RgModule", TestModule);

    await initializeModule(TestModule, metadata);

    expect(container.hasModule(TestModule)).toBe(true);
    expect(container.hasModule(ImportedModule)).toBe(true);
  });

  it("should handle module with all metadata properties", async () => {
    @Injectable()
    class Service {}

    class Handler {
      onInit(data: TParamOnInit) {}
    }

    class Window {}

    @RgModule({
      providers: [],
    })
    class ImportedModule {}

    @RgModule({
      imports: [ImportedModule],
      providers: [Service],
      ipc: [Handler],
      windows: [Window],
      exports: [Service],
    })
    class CompleteModule {}

    const metadata = Reflect.getMetadata("RgModule", CompleteModule);

    await initializeModule(CompleteModule, metadata);

    expect(container.hasModule(CompleteModule)).toBe(true);
    expect(container.getProvider(CompleteModule, Service)).toBe(Service);
  });

  it("should handle empty metadata", async () => {
    @RgModule({})
    class MinimalModule {}

    const metadata = Reflect.getMetadata("RgModule", MinimalModule);

    await initializeModule(MinimalModule, metadata);

    expect(container.hasModule(MinimalModule)).toBe(true);
  });

  it("should enforce lazy constraints for imported modules", async () => {
    class ExportedService {}

    @RgModule({
      providers: [ExportedService],
      exports: [ExportedService],
      lazy: { enabled: true, trigger: "db" },
    })
    class InvalidLazyImport {}

    @RgModule({
      imports: [InvalidLazyImport],
      providers: [],
    })
    class HostModule {}

    const metadata = Reflect.getMetadata("RgModule", HostModule);

    await expect(initializeModule(HostModule, metadata)).rejects.toThrow(
      EagerModuleCannotImportLazyModuleError,
    );
  });
});
