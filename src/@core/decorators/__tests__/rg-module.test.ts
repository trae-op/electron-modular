import { describe, it, expect } from "vitest";
import { RgModule } from "../rg-module.js";
import type { TParamOnInit } from "../../types/ipc-handler.js";
import "reflect-metadata/lite";

describe("RgModule decorator", () => {
  it("should store module metadata", () => {
    const metadata = {
      providers: [],
      exports: [],
    };

    @RgModule(metadata)
    class TestModule {}

    const storedMetadata = Reflect.getMetadata("RgModule", TestModule);
    expect(storedMetadata).toEqual(metadata);
  });

  it("should store imports", () => {
    class ImportedModule {}

    @RgModule({
      imports: [ImportedModule],
    })
    class TestModule {}

    const metadata = Reflect.getMetadata("RgModule", TestModule);
    expect(metadata.imports).toEqual([ImportedModule]);
  });

  it("should store providers", () => {
    class ServiceA {}
    class ServiceB {}

    @RgModule({
      providers: [ServiceA, ServiceB],
    })
    class TestModule {}

    const metadata = Reflect.getMetadata("RgModule", TestModule);
    expect(metadata.providers).toEqual([ServiceA, ServiceB]);
  });

  it("should store exports", () => {
    const TOKEN1 = Symbol("token1");
    const TOKEN2 = "token2";

    @RgModule({
      exports: [TOKEN1, TOKEN2],
    })
    class TestModule {}

    const metadata = Reflect.getMetadata("RgModule", TestModule);
    expect(metadata.exports).toEqual([TOKEN1, TOKEN2]);
  });

  it("should store IPC handlers", () => {
    class Handler1 {
      onInit(data: TParamOnInit) {}
    }
    class Handler2 {
      onInit(data: TParamOnInit) {}
    }

    @RgModule({
      ipc: [Handler1, Handler2],
    })
    class TestModule {}

    const metadata = Reflect.getMetadata("RgModule", TestModule);
    expect(metadata.ipc).toEqual([Handler1, Handler2]);
  });

  it("should store windows", () => {
    class Window1 {}
    class Window2 {}

    @RgModule({
      windows: [Window1, Window2],
    })
    class TestModule {}

    const metadata = Reflect.getMetadata("RgModule", TestModule);
    expect(metadata.windows).toEqual([Window1, Window2]);
  });

  it("should handle empty metadata", () => {
    @RgModule({})
    class TestModule {}

    const metadata = Reflect.getMetadata("RgModule", TestModule);
    expect(metadata).toEqual({});
  });

  it("should work with complete metadata", () => {
    class ImportModule {}
    class Provider1 {}
    class Handler1 {
      onInit(data: TParamOnInit) {}
    }
    class Window1 {}
    const EXPORT_TOKEN = Symbol("export");

    @RgModule({
      imports: [ImportModule],
      providers: [Provider1],
      ipc: [Handler1],
      windows: [Window1],
      exports: [EXPORT_TOKEN],
    })
    class CompleteModule {}

    const metadata = Reflect.getMetadata("RgModule", CompleteModule);
    expect(metadata.imports).toEqual([ImportModule]);
    expect(metadata.providers).toEqual([Provider1]);
    expect(metadata.ipc).toEqual([Handler1]);
    expect(metadata.windows).toEqual([Window1]);
    expect(metadata.exports).toEqual([EXPORT_TOKEN]);
  });
});
