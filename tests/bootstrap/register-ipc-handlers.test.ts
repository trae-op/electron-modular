import { describe, expect, it, beforeEach, vi } from "vitest";
import { registerIpcHandlers } from "../../src/@core/bootstrap/register-ipc-handlers.js";
import type { RgModuleMetadata } from "../../src/@core/types/module-metadata.js";
import { container } from "../../src/@core/container.js";

describe("registerIpcHandlers", () => {
  let TestModule: any;

  beforeEach(() => {
    TestModule = class TestModule {};
    container.addModule(TestModule, { providers: [], exports: [] });
  });

  it("should register IPC handler classes", async () => {
    class IpcHandlerA {
      onInit() {}
    }
    class IpcHandlerB {
      onInit() {}
    }

    const metadata: RgModuleMetadata = {
      ipc: [IpcHandlerA, IpcHandlerB],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerIpcHandlers(TestModule, metadata);

    expect(addProviderSpy).toHaveBeenCalledWith(TestModule, IpcHandlerA);
    expect(addProviderSpy).toHaveBeenCalledWith(TestModule, IpcHandlerB);
    expect(addProviderSpy).toHaveBeenCalledTimes(2);
  });

  it("should do nothing when no IPC handlers", async () => {
    const metadata: RgModuleMetadata = {};

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerIpcHandlers(TestModule, metadata);

    expect(addProviderSpy).not.toHaveBeenCalled();
  });

  it("should do nothing when ipc array is empty", async () => {
    const metadata: RgModuleMetadata = {
      ipc: [],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerIpcHandlers(TestModule, metadata);

    expect(addProviderSpy).not.toHaveBeenCalled();
  });

  it("should handle single IPC handler", async () => {
    class SingleIpcHandler {
      onInit(data: any) {
        return data;
      }
    }

    const metadata: RgModuleMetadata = {
      ipc: [SingleIpcHandler],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerIpcHandlers(TestModule, metadata);

    expect(addProviderSpy).toHaveBeenCalledWith(TestModule, SingleIpcHandler);
    expect(addProviderSpy).toHaveBeenCalledTimes(1);
  });

  it("should register IPC handlers in order", async () => {
    const handlers: any[] = [];

    class Handler1 {
      onInit() {
        handlers.push(1);
      }
    }
    class Handler2 {
      onInit() {
        handlers.push(2);
      }
    }
    class Handler3 {
      onInit() {
        handlers.push(3);
      }
    }

    const metadata: RgModuleMetadata = {
      ipc: [Handler1, Handler2, Handler3],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerIpcHandlers(TestModule, metadata);

    const calls = addProviderSpy.mock.calls;
    expect(calls[0][1]).toBe(Handler1);
    expect(calls[1][1]).toBe(Handler2);
    expect(calls[2][1]).toBe(Handler3);
  });

  it("should handle IPC handlers with dependencies", async () => {
    class ServiceDependency {}

    class IpcHandlerWithDeps {
      constructor(public service: ServiceDependency) {}
      onInit() {}
    }

    const metadata: RgModuleMetadata = {
      ipc: [IpcHandlerWithDeps],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerIpcHandlers(TestModule, metadata);

    expect(addProviderSpy).toHaveBeenCalledWith(TestModule, IpcHandlerWithDeps);
  });
});
