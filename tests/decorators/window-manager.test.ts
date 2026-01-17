import { describe, expect, it } from "vitest";
import { WindowManager } from "../../src/@core/decorators/window-manager.js";
import type { TParamsCreateWindow } from "../../src/@core/control-window/types.js";

describe("@WindowManager Decorator", () => {
  it("should store window metadata", () => {
    const options: TParamsCreateWindow = {
      hash: "main-window",
      isCache: true,
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

  it("should handle window with hash only", () => {
    @WindowManager({ hash: "simple-window" })
    class SimpleWindow {}

    const metadata = Reflect.getMetadata("WindowManager", SimpleWindow);
    expect(metadata.hash).toBe("simple-window");
  });

  it("should handle complex window options", () => {
    const options: TParamsCreateWindow = {
      hash: "advanced-window",
      isCache: true,
      paramsRoute: {
        id: "123",
        mode: "edit",
      },
      options: {
        width: 1024,
        height: 768,
        resizable: false,
        frame: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      },
      loadURL: "https://example.com",
    };

    @WindowManager(options)
    class AdvancedWindow {}

    const metadata = Reflect.getMetadata("WindowManager", AdvancedWindow);
    expect(metadata).toEqual(options);
    expect(metadata.paramsRoute?.id).toBe("123");
    expect(metadata.options?.width).toBe(1024);
    expect(metadata.loadURL).toBe("https://example.com");
  });

  it("should preserve class functionality", () => {
    @WindowManager({ hash: "test-window" })
    class TestWindow {
      onReady() {
        return "ready";
      }
    }

    const instance = new TestWindow();
    expect(instance.onReady()).toBe("ready");
  });

  it("should work with multiple window managers", () => {
    @WindowManager({ hash: "window-a" })
    class WindowA {}

    @WindowManager({ hash: "window-b" })
    class WindowB {}

    const metadataA = Reflect.getMetadata("WindowManager", WindowA);
    const metadataB = Reflect.getMetadata("WindowManager", WindowB);

    expect(metadataA.hash).toBe("window-a");
    expect(metadataB.hash).toBe("window-b");
  });

  it("should handle window with event handlers", () => {
    @WindowManager({ hash: "event-window", isCache: true })
    class EventWindow {
      onWindowReady() {}
      onWebContentsDidFinishLoad() {}
      onWindowClose() {}
    }

    const metadata = Reflect.getMetadata("WindowManager", EventWindow);
    expect(metadata.hash).toBe("event-window");
    expect(metadata.isCache).toBe(true);

    const instance = new EventWindow();
    expect(typeof instance.onWindowReady).toBe("function");
    expect(typeof instance.onWebContentsDidFinishLoad).toBe("function");
    expect(typeof instance.onWindowClose).toBe("function");
  });
});
