import { describe, expect, it, beforeEach, vi } from "vitest";
import { cacheWindows } from "../../src/@core/control-window/cache.js";

describe("cacheWindows", () => {
  beforeEach(() => {
    cacheWindows.clear();
  });

  it("should be a Map instance", () => {
    expect(cacheWindows).toBeInstanceOf(Map);
  });

  it("should allow setting window references", () => {
    const mockWindow = { id: 1, isDestroyed: () => false } as any;

    cacheWindows.set("main-window", mockWindow);

    expect(cacheWindows.has("main-window")).toBe(true);
    expect(cacheWindows.get("main-window")).toBe(mockWindow);
  });

  it("should allow getting window references", () => {
    const mockWindow = { id: 2, isDestroyed: () => false } as any;

    cacheWindows.set("settings-window", mockWindow);
    const retrieved = cacheWindows.get("settings-window");

    expect(retrieved).toBe(mockWindow);
    expect(retrieved?.id).toBe(2);
  });

  it("should support multiple windows", () => {
    const window1 = { id: 1 } as any;
    const window2 = { id: 2 } as any;
    const window3 = { id: 3 } as any;

    cacheWindows.set("main", window1);
    cacheWindows.set("settings", window2);
    cacheWindows.set("about", window3);

    expect(cacheWindows.size).toBe(3);
    expect(cacheWindows.get("main")).toBe(window1);
    expect(cacheWindows.get("settings")).toBe(window2);
    expect(cacheWindows.get("about")).toBe(window3);
  });

  it("should allow deleting windows", () => {
    const mockWindow = { id: 1 } as any;

    cacheWindows.set("temp-window", mockWindow);
    expect(cacheWindows.has("temp-window")).toBe(true);

    cacheWindows.delete("temp-window");
    expect(cacheWindows.has("temp-window")).toBe(false);
  });

  it("should allow clearing all windows", () => {
    cacheWindows.set("window1", { id: 1 } as any);
    cacheWindows.set("window2", { id: 2 } as any);

    expect(cacheWindows.size).toBe(2);

    cacheWindows.clear();

    expect(cacheWindows.size).toBe(0);
  });

  it("should return undefined for non-existent windows", () => {
    const result = cacheWindows.get("non-existent");
    expect(result).toBeUndefined();
  });

  it("should maintain window references correctly", () => {
    const window1 = { id: 1, name: "Main" } as any;
    const window2 = { id: 2, name: "Settings" } as any;

    cacheWindows.set("main", window1);
    cacheWindows.set("settings", window2);

    // Verify references haven't changed
    expect((cacheWindows.get("main") as any)?.name).toBe("Main");
    expect((cacheWindows.get("settings") as any)?.name).toBe("Settings");
  });

  it("should allow updating window references", () => {
    const window1 = { id: 1, version: 1 } as any;
    const window2 = { id: 1, version: 2 } as any;

    cacheWindows.set("updatable", window1);
    expect((cacheWindows.get("updatable") as any)?.version).toBe(1);

    cacheWindows.set("updatable", window2);
    expect((cacheWindows.get("updatable") as any)?.version).toBe(2);
  });

  it("should work with any valid key type", () => {
    const mockWindow = { id: 1 } as any;

    cacheWindows.set("string-key", mockWindow);
    expect(cacheWindows.has("string-key")).toBe(true);
  });

  it("should preserve insertion order when iterating", () => {
    cacheWindows.set("first", { id: 1 } as any);
    cacheWindows.set("second", { id: 2 } as any);
    cacheWindows.set("third", { id: 3 } as any);

    const keys = Array.from(cacheWindows.keys());

    expect(keys).toEqual(["first", "second", "third"]);
  });
});
