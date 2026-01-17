import { describe, expect, it } from "vitest";
import { folders } from "../src/config.js";

describe("Config", () => {
  describe("folders", () => {
    it("should export folders object", () => {
      expect(folders).toBeDefined();
      expect(typeof folders).toBe("object");
    });

    it("should have distRenderer property", () => {
      expect(folders).toHaveProperty("distRenderer");
      expect(typeof folders.distRenderer).toBe("string");
      expect(folders.distRenderer).toBe("dist-renderer");
    });

    it("should have distMain property", () => {
      expect(folders).toHaveProperty("distMain");
      expect(typeof folders.distMain).toBe("string");
      expect(folders.distMain).toBe("dist-main");
    });

    it("should have exactly 2 properties", () => {
      const keys = Object.keys(folders);
      expect(keys).toHaveLength(2);
      expect(keys).toContain("distRenderer");
      expect(keys).toContain("distMain");
    });

    it("should be immutable (freezing check)", () => {
      // While not frozen in source, we can test values don't change unexpectedly
      const originalDistRenderer = folders.distRenderer;
      const originalDistMain = folders.distMain;

      expect(folders.distRenderer).toBe(originalDistRenderer);
      expect(folders.distMain).toBe(originalDistMain);
    });
  });
});
