import { describe, expect, it } from "vitest";
import { RgModule } from "../../src/@core/decorators/rg-module.js";
import type { RgModuleMetadata } from "../../src/@core/types/module-metadata.js";

describe("@RgModule Decorator", () => {
  it("should store module metadata", () => {
    const metadata: RgModuleMetadata = {
      providers: [],
      exports: [],
    };

    @RgModule(metadata)
    class TestModule {}

    const storedMetadata = Reflect.getMetadata("RgModule", TestModule);
    expect(storedMetadata).toEqual(metadata);
  });

  it("should handle complete module configuration", () => {
    class ServiceA {}
    class ServiceB {}
    class IpcHandlerA {
      onInit(_: unknown) {}
    }
    class WindowA {}
    class ImportedModule {}

    const metadata: RgModuleMetadata = {
      imports: [ImportedModule],
      providers: [ServiceA, ServiceB],
      exports: [ServiceA],
      ipc: [IpcHandlerA],
      windows: [WindowA],
    };

    @RgModule(metadata)
    class TestModule {}

    const storedMetadata = Reflect.getMetadata("RgModule", TestModule);
    expect(storedMetadata).toEqual(metadata);
    expect(storedMetadata.imports).toContain(ImportedModule);
    expect(storedMetadata.providers).toContain(ServiceA);
    expect(storedMetadata.exports).toContain(ServiceA);
    expect(storedMetadata.ipc).toContain(IpcHandlerA);
    expect(storedMetadata.windows).toContain(WindowA);
  });

  it("should handle minimal module configuration", () => {
    @RgModule({})
    class MinimalModule {}

    const metadata = Reflect.getMetadata("RgModule", MinimalModule);
    expect(metadata).toEqual({});
  });

  it("should work with provider objects", () => {
    class ServiceA {}
    const TOKEN = "service-b-token";

    const metadata: RgModuleMetadata = {
      providers: [
        ServiceA,
        {
          provide: TOKEN,
          useValue: { value: "test" },
        },
      ],
    };

    @RgModule(metadata)
    class TestModule {}

    const storedMetadata = Reflect.getMetadata("RgModule", TestModule);
    expect(storedMetadata.providers).toHaveLength(2);
    expect(storedMetadata.providers[0]).toBe(ServiceA);
    expect(storedMetadata.providers[1]).toHaveProperty("provide", TOKEN);
  });

  it("should preserve class functionality", () => {
    @RgModule({ providers: [] })
    class TestModule {
      value = 42;

      getValue() {
        return this.value;
      }
    }

    const instance = new TestModule();
    expect(instance.getValue()).toBe(42);
  });

  it("should allow multiple modules with different metadata", () => {
    @RgModule({ providers: ["A" as any] })
    class ModuleA {}

    @RgModule({ providers: ["B" as any] })
    class ModuleB {}

    const metadataA = Reflect.getMetadata("RgModule", ModuleA);
    const metadataB = Reflect.getMetadata("RgModule", ModuleB);

    expect(metadataA.providers).toEqual(["A"]);
    expect(metadataB.providers).toEqual(["B"]);
  });
});
