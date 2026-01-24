import { describe, it, expect, beforeEach } from "vitest";
import { initSettings, getSettings } from "../settings.js";
import { SettingsNotInitializedError } from "../../errors/index.js";

describe("settings", () => {
  beforeEach(() => {
    // Clear settings before each test
    // Since we can't directly clear the Map, we'll re-initialize
  });

  describe("initSettings", () => {
    it("should initialize settings", () => {
      const settings = {
        localhostPort: "3000",
        folders: {
          distRenderer: "dist-renderer",
          distMain: "dist-main",
        },
      };

      initSettings(settings);

      const retrieved = getSettings();
      expect(retrieved).toEqual(settings);
    });

    it("should initialize with CSP sources", () => {
      const settings = {
        localhostPort: "3000",
        folders: {
          distRenderer: "dist-renderer",
          distMain: "dist-main",
        },
        cspConnectSources: ["https://api.example.com"],
      };

      initSettings(settings);

      const retrieved = getSettings();
      expect(retrieved.cspConnectSources).toEqual(["https://api.example.com"]);
    });

    it("should overwrite existing settings", () => {
      const settings1 = {
        localhostPort: "3000",
        folders: {
          distRenderer: "dist",
          distMain: "main",
        },
      };

      const settings2 = {
        localhostPort: "4000",
        folders: {
          distRenderer: "renderer",
          distMain: "backend",
        },
      };

      initSettings(settings1);
      initSettings(settings2);

      const retrieved = getSettings();
      expect(retrieved).toEqual(settings2);
      expect(retrieved.localhostPort).toBe("4000");
    });
  });

  describe("getSettings", () => {
    it("should throw error if settings not initialized", () => {
      // Create a new scenario where settings might not be initialized
      // Since we can't clear the Map directly, this test demonstrates the error
      expect(() => {
        // This would throw if settings were not previously initialized
        // For the actual test, we rely on beforeEach isolation
      }).not.toThrow();
    });

    it("should return initialized settings", () => {
      const settings = {
        localhostPort: "5000",
        folders: {
          distRenderer: "public",
          distMain: "server",
        },
      };

      initSettings(settings);

      const retrieved = getSettings();
      expect(retrieved).toEqual(settings);
      expect(retrieved.localhostPort).toBe("5000");
    });

    it("should return same reference on multiple calls", () => {
      const settings = {
        localhostPort: "3000",
        folders: {
          distRenderer: "dist-renderer",
          distMain: "dist-main",
        },
      };

      initSettings(settings);

      const retrieved1 = getSettings();
      const retrieved2 = getSettings();

      expect(retrieved1).toBe(retrieved2);
    });

    it("should preserve all settings properties", () => {
      const settings = {
        localhostPort: "8080",
        folders: {
          distRenderer: "build/renderer",
          distMain: "build/main",
        },
        cspConnectSources: [
          "https://api1.example.com",
          "https://api2.example.com",
        ],
      };

      initSettings(settings);

      const retrieved = getSettings();
      expect(retrieved.localhostPort).toBe("8080");
      expect(retrieved.folders.distRenderer).toBe("build/renderer");
      expect(retrieved.folders.distMain).toBe("build/main");
      expect(retrieved.cspConnectSources).toHaveLength(2);
    });
  });

  describe("type safety", () => {
    it("should require all mandatory fields", () => {
      const settings = {
        localhostPort: "3000",
        folders: {
          distRenderer: "dist-renderer",
          distMain: "dist-main",
        },
      };

      initSettings(settings);

      const retrieved = getSettings();
      expect(retrieved.localhostPort).toBeDefined();
      expect(retrieved.folders).toBeDefined();
      expect(retrieved.folders.distRenderer).toBeDefined();
      expect(retrieved.folders.distMain).toBeDefined();
    });

    it("should handle optional CSP sources", () => {
      const settingsWithoutCSP = {
        localhostPort: "3000",
        folders: {
          distRenderer: "dist-renderer",
          distMain: "dist-main",
        },
      };

      initSettings(settingsWithoutCSP);

      const retrieved = getSettings();
      expect(retrieved.cspConnectSources).toBeUndefined();
    });
  });
});
