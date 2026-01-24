import { describe, it, expect } from "vitest";
import { folders } from "../config.js";

describe("config", () => {
  describe("folders", () => {
    it("should export distRenderer folder name", () => {
      expect(folders.distRenderer).toBe("dist-renderer");
    });

    it("should export distMain folder name", () => {
      expect(folders.distMain).toBe("dist-main");
    });

    it("should have both folder properties", () => {
      expect(folders).toHaveProperty("distRenderer");
      expect(folders).toHaveProperty("distMain");
    });

    it("should contain string values", () => {
      expect(typeof folders.distRenderer).toBe("string");
      expect(typeof folders.distMain).toBe("string");
    });

    it("should not be empty strings", () => {
      expect(folders.distRenderer.length).toBeGreaterThan(0);
      expect(folders.distMain.length).toBeGreaterThan(0);
    });
  });
});
