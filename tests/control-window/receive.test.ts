import { describe, expect, it, beforeEach, vi } from "vitest";
import { getWindow } from "../../src/@core/control-window/receive.js";
import { cacheWindows } from "../../src/@core/control-window/cache.js";

// Mock BrowserWindow
const createMockBrowserWindow = (destroyed = false) => ({
  id: Math.random(),
  isDestroyed: vi.fn(() => destroyed),
  show: vi.fn(),
  hide: vi.fn(),
  close: vi.fn(),
  on: vi.fn(),
  loadURL: vi.fn(),
  loadFile: vi.fn(),
});

describe("getWindow", () => {
  beforeEach(() => {
    cacheWindows.clear();
  });

  it("should return window from cache", () => {
    const mockWindow = createMockBrowserWindow();
    cacheWindows.set("main-window", mockWindow as any);

    const result = getWindow("main-window");

    expect(result).toBe(mockWindow);
  });

  it("should return undefined for non-existent window", () => {
    const result = getWindow("non-existent");

    expect(result).toBeUndefined();
  });

  it("should return undefined for destroyed window", () => {
    const mockWindow = createMockBrowserWindow(true);
    cacheWindows.set("destroyed-window", mockWindow as any);

    const result = getWindow("destroyed-window");

    expect(result).toBeUndefined();
  });

  it("should return undefined when cache has boolean value", () => {
    cacheWindows.set("boolean-value", true as any);

    const result = getWindow("boolean-value");

    expect(result).toBeUndefined();
  });

  it("should return valid window reference", () => {
    const mockWindow = createMockBrowserWindow();
    cacheWindows.set("valid-window", mockWindow as any);

    const result = getWindow("valid-window");

    expect(result).toBeDefined();
    expect(typeof result?.isDestroyed).toBe("function");
    expect(result?.isDestroyed()).toBe(false);
  });

  it("should check if window is destroyed", () => {
    const mockWindow = createMockBrowserWindow(false);
    cacheWindows.set("check-destroyed", mockWindow as any);

    getWindow("check-destroyed");

    expect(mockWindow.isDestroyed).toHaveBeenCalled();
  });

  it("should handle multiple windows", () => {
    const window1 = createMockBrowserWindow();
    const window2 = createMockBrowserWindow();
    const window3 = createMockBrowserWindow();

    cacheWindows.set("window1", window1 as any);
    cacheWindows.set("window2", window2 as any);
    cacheWindows.set("window3", window3 as any);

    expect(getWindow("window1")).toBe(window1);
    expect(getWindow("window2")).toBe(window2);
    expect(getWindow("window3")).toBe(window3);
  });

  it("should return undefined for empty string key", () => {
    const result = getWindow("");

    expect(result).toBeUndefined();
  });

  it("should work with different window names", () => {
    const mainWindow = createMockBrowserWindow();
    const settingsWindow = createMockBrowserWindow();
    const aboutWindow = createMockBrowserWindow();

    cacheWindows.set("main", mainWindow as any);
    cacheWindows.set("settings", settingsWindow as any);
    cacheWindows.set("about", aboutWindow as any);

    expect(getWindow("main")).toBe(mainWindow);
    expect(getWindow("settings")).toBe(settingsWindow);
    expect(getWindow("about")).toBe(aboutWindow);
    expect(getWindow("non-existent")).toBeUndefined();
  });

  it("should return undefined after window is destroyed", () => {
    const mockWindow = createMockBrowserWindow(false);
    cacheWindows.set("to-be-destroyed", mockWindow as any);

    // Window is not destroyed yet
    expect(getWindow("to-be-destroyed")).toBe(mockWindow);

    // Simulate window destruction
    mockWindow.isDestroyed = () => true;

    // Should now return undefined
    expect(getWindow("to-be-destroyed")).toBeUndefined();
  });

  it("should handle cache updates", () => {
    const window1 = createMockBrowserWindow();
    const window2 = createMockBrowserWindow();

    cacheWindows.set("updatable", window1 as any);
    expect(getWindow("updatable")).toBe(window1);

    // Update cache
    cacheWindows.set("updatable", window2 as any);
    expect(getWindow("updatable")).toBe(window2);
  });

  it("should not throw errors for null or undefined in cache", () => {
    cacheWindows.set("null-value", null as any);
    cacheWindows.set("undefined-value", undefined as any);

    expect(() => getWindow("null-value")).not.toThrow();
    expect(() => getWindow("undefined-value")).not.toThrow();

    expect(getWindow("null-value")).toBeUndefined();
    expect(getWindow("undefined-value")).toBeUndefined();
  });
});
