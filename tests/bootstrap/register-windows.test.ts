import { describe, expect, it, beforeEach, vi } from "vitest";
import { registerWindows } from "../../src/@core/bootstrap/register-windows.js";
import type { RgModuleMetadata } from "../../src/@core/types/module-metadata.js";
import { container } from "../../src/@core/container.js";

describe("registerWindows", () => {
  let TestModule: any;

  beforeEach(() => {
    TestModule = class TestModule {};
    container.addModule(TestModule, { providers: [], exports: [] });
  });

  it("should register windows with hash", async () => {
    const windowMetadata = {
      hash: "main-window",
      options: { width: 800, height: 600 },
    };

    class MainWindow {}
    Reflect.defineMetadata("WindowManager", windowMetadata, MainWindow);

    const metadata: RgModuleMetadata = {
      windows: [MainWindow],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerWindows(TestModule, metadata);

    expect(addProviderSpy).toHaveBeenCalledWith(
      TestModule,
      "main-window",
      expect.objectContaining({
        metadata: windowMetadata,
        windowClass: MainWindow,
      }),
    );
  });

  it("should not register windows without hash", async () => {
    const windowMetadata = {
      options: { width: 800, height: 600 },
      // No hash
    };

    class WindowWithoutHash {}
    Reflect.defineMetadata("WindowManager", windowMetadata, WindowWithoutHash);

    const metadata: RgModuleMetadata = {
      windows: [WindowWithoutHash],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerWindows(TestModule, metadata);

    expect(addProviderSpy).not.toHaveBeenCalled();
  });

  it("should do nothing when no windows", async () => {
    const metadata: RgModuleMetadata = {};

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerWindows(TestModule, metadata);

    expect(addProviderSpy).not.toHaveBeenCalled();
  });

  it("should do nothing when windows array is empty", async () => {
    const metadata: RgModuleMetadata = {
      windows: [],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerWindows(TestModule, metadata);

    expect(addProviderSpy).not.toHaveBeenCalled();
  });

  it("should register multiple windows", async () => {
    class MainWindow {}
    class SettingsWindow {}

    Reflect.defineMetadata(
      "WindowManager",
      { hash: "main", options: {} },
      MainWindow,
    );
    Reflect.defineMetadata(
      "WindowManager",
      { hash: "settings", options: {} },
      SettingsWindow,
    );

    const metadata: RgModuleMetadata = {
      windows: [MainWindow, SettingsWindow],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerWindows(TestModule, metadata);

    expect(addProviderSpy).toHaveBeenCalledTimes(2);
    expect(addProviderSpy).toHaveBeenCalledWith(
      TestModule,
      "main",
      expect.any(Object),
    );
    expect(addProviderSpy).toHaveBeenCalledWith(
      TestModule,
      "settings",
      expect.any(Object),
    );
  });

  it("should handle windows with complete metadata", async () => {
    const completeMetadata = {
      hash: "advanced-window",
      isCache: true,
      paramsRoute: { id: "123" },
      options: {
        width: 1024,
        height: 768,
        resizable: false,
      },
      loadURL: "https://example.com",
    };

    class AdvancedWindow {}
    Reflect.defineMetadata("WindowManager", completeMetadata, AdvancedWindow);

    const metadata: RgModuleMetadata = {
      windows: [AdvancedWindow],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerWindows(TestModule, metadata);

    expect(addProviderSpy).toHaveBeenCalledWith(TestModule, "advanced-window", {
      metadata: completeMetadata,
      windowClass: AdvancedWindow,
    });
  });

  it("should skip windows without metadata", async () => {
    class WindowWithoutMetadata {}
    // No metadata defined

    const metadata: RgModuleMetadata = {
      windows: [WindowWithoutMetadata],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerWindows(TestModule, metadata);

    expect(addProviderSpy).not.toHaveBeenCalled();
  });

  it("should preserve window class reference", async () => {
    class CustomWindow {
      customMethod() {
        return "test";
      }
    }

    Reflect.defineMetadata(
      "WindowManager",
      { hash: "custom", options: {} },
      CustomWindow,
    );

    const metadata: RgModuleMetadata = {
      windows: [CustomWindow],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerWindows(TestModule, metadata);

    const call = addProviderSpy.mock.calls[0];
    const providerValue = call[2] as any;

    expect(providerValue.windowClass).toBe(CustomWindow);
    expect(providerValue.windowClass.prototype.customMethod).toBeDefined();
  });
});
