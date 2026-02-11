import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerLazyModule } from "../register-lazy-module.js";
import { bootstrapModules } from "../bootstrap.js";
import { RgModule } from "../../decorators/rg-module.js";
import { container } from "../../container.js";
import { ipcMain } from "electron";
import "reflect-metadata/lite";

describe("registerLazyModule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register an ipcMain.handle listener with the trigger name", () => {
    @RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "analytics" },
    })
    class LazyModule {}

    const metadata = Reflect.getMetadata("RgModule", LazyModule);
    registerLazyModule(LazyModule, metadata);

    expect(ipcMain.handle).toHaveBeenCalledWith(
      "analytics",
      expect.any(Function),
    );
  });

  it("should not initialize module during registration", () => {
    @RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "deferred" },
    })
    class DeferredModule {}

    const metadata = Reflect.getMetadata("RgModule", DeferredModule);
    registerLazyModule(DeferredModule, metadata);

    expect(container.hasModule(DeferredModule)).toBe(false);
  });

  it("should initialize module when IPC trigger is invoked", async () => {
    class TestService {
      value = "lazy-test";
    }

    @RgModule({
      providers: [TestService],
      lazy: { enabled: true, trigger: "test-lazy" },
    })
    class LazyTestModule {}

    const metadata = Reflect.getMetadata("RgModule", LazyTestModule);
    registerLazyModule(LazyTestModule, metadata);

    const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
    const handler = handleCall[1] as () => Promise<unknown>;

    const result = await handler();

    expect(result).toEqual({
      initialized: true,
      name: "test-lazy",
    });
    expect(container.hasModule(LazyTestModule)).toBe(true);
  });

  it("should return error response when initialization fails", async () => {
    class FailingModule {
      constructor() {
        throw new Error("Initialization failed");
      }
    }

    RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "fail-module" },
    })(FailingModule);

    const metadata = Reflect.getMetadata("RgModule", FailingModule);
    registerLazyModule(FailingModule, metadata);

    const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
    const handler = handleCall[1] as () => Promise<unknown>;

    const result = await handler();

    expect(result).toEqual({
      initialized: false,
      name: "fail-module",
      error: {
        message: expect.any(String),
      },
    });
  });

  it("should return same result for concurrent invocations", async () => {
    @RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "concurrent" },
    })
    class ConcurrentModule {}

    const metadata = Reflect.getMetadata("RgModule", ConcurrentModule);
    registerLazyModule(ConcurrentModule, metadata);

    const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
    const handler = handleCall[1] as () => Promise<unknown>;

    const [result1, result2] = await Promise.all([handler(), handler()]);

    expect(result1).toEqual({
      initialized: true,
      name: "concurrent",
    });
    expect(result2).toEqual(result1);
  });

  it("should allow retry after failure", async () => {
    let callCount = 0;

    class RetryModuleClass {
      constructor() {
        callCount++;
        if (callCount === 1) {
          throw new Error("First call fails");
        }
      }
    }

    RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "retry-module" },
    })(RetryModuleClass);

    const metadata = Reflect.getMetadata("RgModule", RetryModuleClass);
    registerLazyModule(RetryModuleClass, metadata);

    const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
    const handler = handleCall[1] as () => Promise<unknown>;

    const firstResult = (await handler()) as { initialized: boolean };
    expect(firstResult.initialized).toBe(false);

    const secondResult = (await handler()) as { initialized: boolean };
    expect(secondResult.initialized).toBe(true);
  });
});

describe("bootstrapModules with lazy modules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not initialize lazy modules during bootstrap", async () => {
    @RgModule({
      providers: [],
    })
    class EagerModule {}

    @RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "lazy-test" },
    })
    class LazyModule {}

    await bootstrapModules([EagerModule, LazyModule]);

    expect(container.hasModule(EagerModule)).toBe(true);
    expect(container.hasModule(LazyModule)).toBe(false);
    expect(ipcMain.handle).toHaveBeenCalledWith(
      "lazy-test",
      expect.any(Function),
    );
  });

  it("should initialize eager modules normally alongside lazy modules", async () => {
    class EagerService {
      value = "eager";
    }

    @RgModule({
      providers: [EagerService],
    })
    class EagerModule {}

    @RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "lazy-side" },
    })
    class LazyModule {}

    await bootstrapModules([EagerModule, LazyModule]);

    const service = await container.resolve(EagerModule, EagerService);
    expect(service).toBeInstanceOf(EagerService);
  });

  it("should process multiple lazy modules independently", async () => {
    @RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "lazy-a" },
    })
    class LazyModuleA {}

    @RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "lazy-b" },
    })
    class LazyModuleB {}

    await bootstrapModules([LazyModuleA, LazyModuleB]);

    expect(ipcMain.handle).toHaveBeenCalledTimes(2);
    expect(ipcMain.handle).toHaveBeenCalledWith("lazy-a", expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith("lazy-b", expect.any(Function));
  });

  it("should still throw for modules without @RgModule decorator even with lazy modules", async () => {
    class UndecoratedModule {}

    @RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "after-error" },
    })
    class LazyModule {}

    await expect(
      bootstrapModules([UndecoratedModule, LazyModule]),
    ).rejects.toThrow();
  });

  it("should handle mixed eager and lazy modules in order", async () => {
    const initOrder: string[] = [];

    @RgModule({ providers: [] })
    class Eager1 {
      constructor() {
        initOrder.push("Eager1");
      }
    }

    @RgModule({
      providers: [],
      lazy: { enabled: true, trigger: "lazy-mid" },
    })
    class LazyMid {}

    @RgModule({ providers: [] })
    class Eager2 {
      constructor() {
        initOrder.push("Eager2");
      }
    }

    await bootstrapModules([Eager1, LazyMid, Eager2]);

    expect(initOrder).toEqual(["Eager1", "Eager2"]);
    expect(container.hasModule(LazyMid)).toBe(false);
  });
});
