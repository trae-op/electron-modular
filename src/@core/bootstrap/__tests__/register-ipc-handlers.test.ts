import { describe, it, expect, beforeEach } from "vitest";
import { registerIpcHandlers } from "../register-ipc-handlers.js";
import { container } from "../../container.js";
import type { TParamOnInit } from "../../types/ipc-handler.js";
import "reflect-metadata/lite";

describe("registerIpcHandlers", () => {
  let TestModule: any;

  beforeEach(() => {
    TestModule = class TestModule {};
    container.addModule(TestModule, { providers: [] });
  });

  it("should return early if no ipc in metadata", async () => {
    const metadata = {};

    await expect(
      registerIpcHandlers(TestModule, metadata),
    ).resolves.toBeUndefined();
  });

  it("should register IPC handler class", async () => {
    class TestHandler {
      onInit(data: TParamOnInit) {}
    }

    const metadata = {
      ipc: [TestHandler],
    };

    await registerIpcHandlers(TestModule, metadata);

    const provider = container.getProvider(TestModule, TestHandler);
    expect(provider).toBe(TestHandler);
  });

  it("should register multiple IPC handlers", async () => {
    class Handler1 {
      onInit(data: TParamOnInit) {}
    }
    class Handler2 {
      onInit(data: TParamOnInit) {}
    }
    class Handler3 {
      onInit(data: TParamOnInit) {}
    }

    const metadata = {
      ipc: [Handler1, Handler2, Handler3],
    };

    await registerIpcHandlers(TestModule, metadata);

    expect(container.getProvider(TestModule, Handler1)).toBe(Handler1);
    expect(container.getProvider(TestModule, Handler2)).toBe(Handler2);
    expect(container.getProvider(TestModule, Handler3)).toBe(Handler3);
  });

  it("should handle empty ipc array", async () => {
    const metadata = {
      ipc: [],
    };

    await expect(
      registerIpcHandlers(TestModule, metadata),
    ).resolves.toBeUndefined();
  });

  it("should register handlers with constructor parameters", async () => {
    class Dependency {}

    class HandlerWithDeps {
      constructor(public dep: Dependency) {}
      onInit(data: TParamOnInit) {}
    }

    const metadata = {
      ipc: [HandlerWithDeps],
    };

    await registerIpcHandlers(TestModule, metadata);

    const provider = container.getProvider(TestModule, HandlerWithDeps);
    expect(provider).toBe(HandlerWithDeps);
  });
});
