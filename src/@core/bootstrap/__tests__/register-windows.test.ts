import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerWindows } from "../register-windows.js";
import { container } from "../../container.js";
import { WindowManager } from "../../decorators/window-manager.js";
import "reflect-metadata/lite";

describe("registerWindows", () => {
  let TestModule: any;

  beforeEach(() => {
    TestModule = class TestModule {};
    container.addModule(TestModule, { providers: [] });
    vi.clearAllMocks();
  });

  it("should return early if no windows in metadata", async () => {
    const metadata = {};

    await expect(
      registerWindows(TestModule, metadata),
    ).resolves.toBeUndefined();
  });

  it("should register window with hash", async () => {
    @WindowManager({
      hash: "main-window",
      options: { width: 800, height: 600 },
    })
    class MainWindow {}

    const metadata = {
      windows: [MainWindow],
    };

    await registerWindows(TestModule, metadata);

    const provider = container.getProvider(TestModule, "main-window");
    expect(provider).toBeDefined();
    expect(provider).toHaveProperty("metadata");
    expect(provider).toHaveProperty("windowClass");
  });

  it("should register multiple windows", async () => {
    @WindowManager({
      hash: "main-window",
      options: { width: 800 },
    })
    class MainWindow {}

    @WindowManager({
      hash: "settings-window",
      options: { width: 600 },
    })
    class SettingsWindow {}

    const metadata = {
      windows: [MainWindow, SettingsWindow],
    };

    await registerWindows(TestModule, metadata);

    const mainProvider = container.getProvider(TestModule, "main-window");
    const settingsProvider = container.getProvider(
      TestModule,
      "settings-window",
    );

    expect(mainProvider).toBeDefined();
    expect(settingsProvider).toBeDefined();
  });

  it("should not register window without hash", async () => {
    @WindowManager({
      options: { width: 800 },
    })
    class NoHashWindow {}

    const metadata = {
      windows: [NoHashWindow],
    };

    await registerWindows(TestModule, metadata);

    // Since hash is undefined, it shouldn't register
    const provider = container.getProvider(TestModule, undefined as any);
    expect(provider).toBeUndefined();
  });

  it("should handle empty windows array", async () => {
    const metadata = {
      windows: [],
    };

    await expect(
      registerWindows(TestModule, metadata),
    ).resolves.toBeUndefined();
  });

  it("should store window metadata and class", async () => {
    const windowOptions = {
      name: "test" as const,
      hash: "test-window",
      options: { width: 1024, height: 768 },
    };

    @WindowManager(windowOptions)
    class TestWindow {}

    const metadata = {
      windows: [TestWindow],
    };

    await registerWindows(TestModule, metadata);

    const provider = container.getProvider(TestModule, "test-window");
    expect((provider as any).windowClass).toBe(TestWindow);
    expect((provider as any).metadata).toEqual(windowOptions);
  });
});
