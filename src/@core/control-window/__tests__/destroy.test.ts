import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserWindow } from "electron";
import { destroyWindows } from "../destroy.js";

describe("destroyWindows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should destroy all windows", () => {
    const mockWindow1 = {
      isDestroyed: vi.fn(() => false),
      destroy: vi.fn(),
    };

    const mockWindow2 = {
      isDestroyed: vi.fn(() => false),
      destroy: vi.fn(),
    };

    vi.spyOn(BrowserWindow, "getAllWindows").mockReturnValue([
      mockWindow1 as any,
      mockWindow2 as any,
    ]);

    destroyWindows();

    expect(mockWindow1.destroy).toHaveBeenCalledOnce();
    expect(mockWindow2.destroy).toHaveBeenCalledOnce();
  });

  it("should not destroy already destroyed windows", () => {
    const mockWindow1 = {
      isDestroyed: vi.fn(() => true),
      destroy: vi.fn(),
    };

    const mockWindow2 = {
      isDestroyed: vi.fn(() => false),
      destroy: vi.fn(),
    };

    vi.spyOn(BrowserWindow, "getAllWindows").mockReturnValue([
      mockWindow1 as any,
      mockWindow2 as any,
    ]);

    destroyWindows();

    expect(mockWindow1.destroy).not.toHaveBeenCalled();
    expect(mockWindow2.destroy).toHaveBeenCalledOnce();
  });

  it("should handle empty window list", () => {
    vi.spyOn(BrowserWindow, "getAllWindows").mockReturnValue([]);

    expect(() => destroyWindows()).not.toThrow();
  });

  it("should handle single window", () => {
    const mockWindow = {
      isDestroyed: vi.fn(() => false),
      destroy: vi.fn(),
    };

    vi.spyOn(BrowserWindow, "getAllWindows").mockReturnValue([
      mockWindow as any,
    ]);

    destroyWindows();

    expect(mockWindow.destroy).toHaveBeenCalledOnce();
  });

  it("should check isDestroyed before destroying", () => {
    const mockWindow = {
      isDestroyed: vi.fn(() => false),
      destroy: vi.fn(),
    };

    vi.spyOn(BrowserWindow, "getAllWindows").mockReturnValue([
      mockWindow as any,
    ]);

    destroyWindows();

    expect(mockWindow.isDestroyed).toHaveBeenCalled();
    expect(mockWindow.destroy).toHaveBeenCalled();
  });
});
