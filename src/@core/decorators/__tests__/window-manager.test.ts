import { describe, it, expect } from "vitest";
import { WindowManager } from "../window-manager.js";
import "reflect-metadata/lite";

describe("WindowManager decorator", () => {
  it("should store window creation options", () => {
    const options = {
      name: "main" as const,
      options: {
        width: 800,
        height: 600,
      },
    };

    @WindowManager(options)
    class MainWindow {}

    const metadata = Reflect.getMetadata("WindowManager", MainWindow);
    expect(metadata).toEqual(options);
  });

  it("should store window with custom name", () => {
    const options = {
      name: "settings" as const,
      options: {
        width: 600,
        height: 400,
      },
    };

    @WindowManager(options)
    class SettingsWindow {}

    const metadata = Reflect.getMetadata("WindowManager", SettingsWindow);
    expect(metadata.name).toBe("settings");
  });

  it("should store complete BrowserWindow options", () => {
    const options = {
      name: "main" as const,
      options: {
        width: 1024,
        height: 768,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
        title: "Test Window",
      },
    };

    @WindowManager(options)
    class TestWindow {}

    const metadata = Reflect.getMetadata("WindowManager", TestWindow);
    expect(metadata.options.width).toBe(1024);
    expect(metadata.options.height).toBe(768);
    expect(metadata.options.webPreferences).toEqual({
      nodeIntegration: false,
      contextIsolation: true,
    });
  });

  it("should work with minimal options", () => {
    const options = {
      name: "minimal" as const,
      options: {},
    };

    @WindowManager(options)
    class MinimalWindow {}

    const metadata = Reflect.getMetadata("WindowManager", MinimalWindow);
    expect(metadata).toEqual(options);
  });

  it("should not affect non-decorated classes", () => {
    class NonDecoratedWindow {}

    const metadata = Reflect.getMetadata("WindowManager", NonDecoratedWindow);
    expect(metadata).toBeUndefined();
  });

  it("should work with multiple window managers", () => {
    const mainOptions = {
      name: "main" as const,
      options: { width: 800 },
    };

    const settingsOptions = {
      name: "settings" as const,
      options: { width: 600 },
    };

    @WindowManager(mainOptions)
    class MainWindow {}

    @WindowManager(settingsOptions)
    class SettingsWindow {}

    expect(Reflect.getMetadata("WindowManager", MainWindow)).toEqual(
      mainOptions,
    );
    expect(Reflect.getMetadata("WindowManager", SettingsWindow)).toEqual(
      settingsOptions,
    );
  });
});
