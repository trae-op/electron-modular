import { describe, expect, it, vi } from "vitest";
import { destroyWindows } from "../../src/@core/control-window/destroy.js";

// Mock electron module
vi.mock("electron", () => ({
  BrowserWindow: {
    getAllWindows: vi.fn(() => []),
  },
}));

describe("destroyWindows", () => {
  it("should destroy all windows", async () => {
    const { BrowserWindow } = await import("electron");

    const window1 = {
      isDestroyed: vi.fn(() => false),
      destroy: vi.fn(),
    };

    const window2 = {
      isDestroyed: vi.fn(() => false),
      destroy: vi.fn(),
    };

    const window3 = {
      isDestroyed: vi.fn(() => false),
      destroy: vi.fn(),
    };

    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([
      window1,
      window2,
      window3,
    ] as any);

    destroyWindows();

    expect(window1.destroy).toHaveBeenCalled();
    expect(window2.destroy).toHaveBeenCalled();
    expect(window3.destroy).toHaveBeenCalled();
  });

  it("should not destroy already destroyed windows", async () => {
    const { BrowserWindow } = await import("electron");

    const alreadyDestroyed = {
      isDestroyed: vi.fn(() => true),
      destroy: vi.fn(),
    };

    const notDestroyed = {
      isDestroyed: vi.fn(() => false),
      destroy: vi.fn(),
    };

    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([
      alreadyDestroyed,
      notDestroyed,
    ] as any);

    destroyWindows();

    expect(alreadyDestroyed.destroy).not.toHaveBeenCalled();
    expect(notDestroyed.destroy).toHaveBeenCalled();
  });

  it("should handle empty window list", async () => {
    const { BrowserWindow } = await import("electron");

    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([]);

    expect(() => destroyWindows()).not.toThrow();
  });

  it("should check if window is destroyed before destroying", async () => {
    const { BrowserWindow } = await import("electron");

    const window = {
      isDestroyed: vi.fn(() => false),
      destroy: vi.fn(),
    };

    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([window] as any);

    destroyWindows();

    expect(window.isDestroyed).toHaveBeenCalled();
  });

  it("should destroy windows in order", async () => {
    const { BrowserWindow } = await import("electron");

    const destroyOrder: number[] = [];

    const window1 = {
      id: 1,
      isDestroyed: () => false,
      destroy: () => destroyOrder.push(1),
    };

    const window2 = {
      id: 2,
      isDestroyed: () => false,
      destroy: () => destroyOrder.push(2),
    };

    const window3 = {
      id: 3,
      isDestroyed: () => false,
      destroy: () => destroyOrder.push(3),
    };

    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([
      window1,
      window2,
      window3,
    ] as any);

    destroyWindows();

    expect(destroyOrder).toEqual([1, 2, 3]);
  });

  it("should handle mixed destroyed and active windows", async () => {
    const { BrowserWindow } = await import("electron");

    const windows = [
      { isDestroyed: () => true, destroy: vi.fn() },
      { isDestroyed: () => false, destroy: vi.fn() },
      { isDestroyed: () => true, destroy: vi.fn() },
      { isDestroyed: () => false, destroy: vi.fn() },
    ];

    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue(windows as any);

    destroyWindows();

    expect(windows[0].destroy).not.toHaveBeenCalled();
    expect(windows[1].destroy).toHaveBeenCalled();
    expect(windows[2].destroy).not.toHaveBeenCalled();
    expect(windows[3].destroy).toHaveBeenCalled();
  });
});
