import { describe, it, expect, beforeEach } from "vitest";
import { getWindow } from "../receive.js";
import { cacheWindows } from "../cache.js";
import type { BrowserWindow } from "electron";

describe("getWindow", () => {
  beforeEach(() => {
    cacheWindows.clear();
  });

  it("should return undefined if window not found", () => {
    const result = getWindow("nonexistent");
    expect(result).toBeUndefined();
  });

  it("should return cached window", () => {
    const mockWindow = {
      id: 1,
      isDestroyed: () => false,
    } as unknown as BrowserWindow;

    cacheWindows.set("main", mockWindow);

    const result = getWindow("main");
    expect(result).toBe(mockWindow);
  });

  it("should return undefined if window is destroyed", () => {
    const mockWindow = {
      id: 1,
      isDestroyed: () => true,
    } as unknown as BrowserWindow;

    cacheWindows.set("main", mockWindow);

    const result = getWindow("main");
    expect(result).toBeUndefined();
  });

  it("should return undefined if cached value is boolean", () => {
    cacheWindows.set("main", true as any);

    const result = getWindow("main");
    expect(result).toBeUndefined();
  });

  it("should handle different window names", () => {
    const mainWindow = {
      id: 1,
      isDestroyed: () => false,
    } as unknown as BrowserWindow;

    const settingsWindow = {
      id: 2,
      isDestroyed: () => false,
    } as unknown as BrowserWindow;

    cacheWindows.set("main", mainWindow);
    cacheWindows.set("settings", settingsWindow);

    expect(getWindow("main")).toBe(mainWindow);
    expect(getWindow("settings")).toBe(settingsWindow);
  });

  it("should handle string window names", () => {
    const mockWindow = {
      id: 1,
      isDestroyed: () => false,
    } as unknown as BrowserWindow;

    cacheWindows.set("custom-window-name", mockWindow);

    const result = getWindow("custom-window-name");
    expect(result).toBe(mockWindow);
  });

  it("should return undefined after window is removed from cache", () => {
    const mockWindow = {
      id: 1,
      isDestroyed: () => false,
    } as unknown as BrowserWindow;

    cacheWindows.set("main", mockWindow);
    cacheWindows.delete("main");

    const result = getWindow("main");
    expect(result).toBeUndefined();
  });
});
