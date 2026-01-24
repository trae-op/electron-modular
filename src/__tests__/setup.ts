import { beforeEach, vi } from "vitest";
import "reflect-metadata/lite";

vi.mock("electron", async () => {
  const { mockElectron } = await import("../__mocks__/electron.js");
  return mockElectron;
});

beforeEach(() => {
  vi.clearAllMocks();
});
