import { describe, it, expect, vi } from "vitest";
import { initializeIpcHandlers } from "../handlers.js";
import { container } from "../../../container.js";

describe("initializeIpcHandlers", () => {
  it("should await async onInit handler", async () => {
    class TestModule {}
    class TestIpc {}

    let isOnInitCompleted = false;

    const onInit = vi.fn(async () => {
      await Promise.resolve();
      isOnInitCompleted = true;
    });

    const resolveSpy = vi
      .spyOn(container, "resolve")
      .mockResolvedValue({ onInit } as never);

    await initializeIpcHandlers(TestModule, {
      ipc: [TestIpc],
    });

    expect(onInit).toHaveBeenCalledTimes(1);
    expect(isOnInitCompleted).toBe(true);

    resolveSpy.mockRestore();
  });
});
