import { describe, it, expect, beforeEach } from "vitest";
import { cacheWindows } from "../cache.js";

describe("cacheWindows", () => {
  beforeEach(() => {
    cacheWindows.clear();
  });

  it("should be a Map instance", () => {
    expect(cacheWindows).toBeInstanceOf(Map);
  });

  it("should store window references", () => {
    const mockWindow = { id: 1 } as any;
    cacheWindows.set("main", mockWindow);

    expect(cacheWindows.get("main")).toBe(mockWindow);
  });

  it("should allow multiple windows", () => {
    const window1 = { id: 1 } as any;
    const window2 = { id: 2 } as any;

    cacheWindows.set("main", window1);
    cacheWindows.set("settings", window2);

    expect(cacheWindows.get("main")).toBe(window1);
    expect(cacheWindows.get("settings")).toBe(window2);
    expect(cacheWindows.size).toBe(2);
  });

  it("should overwrite existing entries", () => {
    const window1 = { id: 1 } as any;
    const window2 = { id: 2 } as any;

    cacheWindows.set("main", window1);
    cacheWindows.set("main", window2);

    expect(cacheWindows.get("main")).toBe(window2);
    expect(cacheWindows.size).toBe(1);
  });

  it("should delete entries", () => {
    const mockWindow = { id: 1 } as any;
    cacheWindows.set("main", mockWindow);

    cacheWindows.delete("main");

    expect(cacheWindows.get("main")).toBeUndefined();
  });

  it("should clear all entries", () => {
    cacheWindows.set("main", { id: 1 } as any);
    cacheWindows.set("settings", { id: 2 } as any);

    cacheWindows.clear();

    expect(cacheWindows.size).toBe(0);
  });

  it("should check if key exists", () => {
    const mockWindow = { id: 1 } as any;
    cacheWindows.set("main", mockWindow);

    expect(cacheWindows.has("main")).toBe(true);
    expect(cacheWindows.has("settings")).toBe(false);
  });
});
