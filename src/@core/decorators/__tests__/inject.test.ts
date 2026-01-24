import { describe, it, expect } from "vitest";
import { Inject, getInjectedTokens } from "../inject.js";
import "reflect-metadata/lite";

describe("Inject decorator", () => {
  describe("@Inject", () => {
    it("should store injection token for parameter", () => {
      const TOKEN = Symbol("test-token");

      class TestService {
        constructor(@Inject(TOKEN) public dependency: any) {}
      }

      const tokens = getInjectedTokens(TestService);
      expect(tokens[0]).toBe(TOKEN);
    });

    it("should handle multiple injection tokens", () => {
      const TOKEN1 = Symbol("token-1");
      const TOKEN2 = Symbol("token-2");
      const TOKEN3 = Symbol("token-3");

      class TestService {
        constructor(
          @Inject(TOKEN1) public dep1: any,
          @Inject(TOKEN2) public dep2: any,
          @Inject(TOKEN3) public dep3: any,
        ) {}
      }

      const tokens = getInjectedTokens(TestService);
      expect(tokens[0]).toBe(TOKEN1);
      expect(tokens[1]).toBe(TOKEN2);
      expect(tokens[2]).toBe(TOKEN3);
    });

    it("should handle string tokens", () => {
      const TOKEN = "StringToken";

      class TestService {
        constructor(@Inject(TOKEN) public dependency: any) {}
      }

      const tokens = getInjectedTokens(TestService);
      expect(tokens[0]).toBe(TOKEN);
    });

    it("should handle class constructor tokens", () => {
      class DependencyClass {}

      class TestService {
        constructor(@Inject(DependencyClass) public dependency: any) {}
      }

      const tokens = getInjectedTokens(TestService);
      expect(tokens[0]).toBe(DependencyClass);
    });

    it("should ignore property decorators", () => {
      const TOKEN = Symbol("test-token");

      class TestService {
        @Inject(TOKEN)
        public property: any;
      }

      const tokens = getInjectedTokens(TestService);
      expect(Object.keys(tokens).length).toBe(0);
    });

    it("should handle mixed decorated and non-decorated parameters", () => {
      const TOKEN = Symbol("token");

      class Dependency {}

      class TestService {
        constructor(
          @Inject(TOKEN) public injected: any,
          public notInjected: Dependency,
        ) {}
      }

      const tokens = getInjectedTokens(TestService);
      expect(tokens[0]).toBe(TOKEN);
    });

    it("should preserve parameter indexes correctly", () => {
      const TOKEN1 = Symbol("token-1");
      const TOKEN3 = Symbol("token-3");

      class Dep2 {}

      class TestService {
        constructor(
          @Inject(TOKEN1) public dep1: any,
          public dep2: Dep2,
          @Inject(TOKEN3) public dep3: any,
        ) {}
      }

      const tokens = getInjectedTokens(TestService);
      expect(tokens[0]).toBe(TOKEN1);
      expect(tokens[2]).toBe(TOKEN3);
    });
  });

  describe("getInjectedTokens", () => {
    it("should return empty object for class without injections", () => {
      class TestService {}

      const tokens = getInjectedTokens(TestService);
      expect(tokens).toEqual({});
    });

    it("should return empty object for class with no constructor", () => {
      class TestService {
        method() {}
      }

      const tokens = getInjectedTokens(TestService);
      expect(tokens).toEqual({});
    });

    it("should return metadata for decorated parameters", () => {
      const TOKEN = Symbol("test");

      class TestService {
        constructor(@Inject(TOKEN) dep: any) {}
      }

      const tokens = getInjectedTokens(TestService);
      expect(Object.keys(tokens).length).toBeGreaterThan(0);
      expect(tokens[0]).toBe(TOKEN);
    });
  });
});
