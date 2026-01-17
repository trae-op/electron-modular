import { describe, expect, it } from "vitest";
import { IpcHandler } from "../../src/@core/decorators/ipc-handler.js";

describe("@IpcHandler Decorator", () => {
  it("should add IpcHandler metadata to class", () => {
    @IpcHandler()
    class TestIpcHandler {}

    const metadata = Reflect.getMetadata("IpcHandler", TestIpcHandler);
    expect(metadata).toBe(true);
  });

  it("should work with multiple IPC handlers", () => {
    @IpcHandler()
    class HandlerA {}

    @IpcHandler()
    class HandlerB {}

    expect(Reflect.getMetadata("IpcHandler", HandlerA)).toBe(true);
    expect(Reflect.getMetadata("IpcHandler", HandlerB)).toBe(true);
  });

  it("should preserve class methods and properties", () => {
    @IpcHandler()
    class TestIpcHandler {
      value = "test";

      onInit(data: any) {
        return data;
      }
    }

    const instance = new TestIpcHandler();
    expect(instance.value).toBe("test");
    expect(instance.onInit({ test: true })).toEqual({ test: true });
  });

  it("should work with constructor parameters", () => {
    class ServiceDependency {
      name = "service";
    }

    @IpcHandler()
    class TestIpcHandler {
      constructor(public service: ServiceDependency) {}
    }

    const metadata = Reflect.getMetadata("IpcHandler", TestIpcHandler);
    expect(metadata).toBe(true);

    const service = new ServiceDependency();
    const instance = new TestIpcHandler(service);
    expect(instance.service.name).toBe("service");
  });
});
