import { describe, expect, it } from "vitest";
import {
  Inject,
  getInjectedTokens,
} from "../../src/@core/decorators/inject.js";

describe("@Inject Decorator", () => {
  it("should store token metadata for parameter", () => {
    const TOKEN = "test-token";

    class TestService {
      constructor(@Inject(TOKEN) dependency: any) {}
    }

    const tokens = getInjectedTokens(TestService);
    expect(tokens[0]).toBe(TOKEN);
  });

  it("should handle multiple injected parameters", () => {
    const TOKEN_A = "token-a";
    const TOKEN_B = "token-b";
    const TOKEN_C = Symbol("token-c");

    class TestService {
      constructor(
        @Inject(TOKEN_A) depA: any,
        @Inject(TOKEN_B) depB: any,
        @Inject(TOKEN_C) depC: any,
      ) {}
    }

    const tokens = getInjectedTokens(TestService);
    expect(tokens[0]).toBe(TOKEN_A);
    expect(tokens[1]).toBe(TOKEN_B);
    expect(tokens[2]).toBe(TOKEN_C);
  });

  it("should work with class constructors as tokens", () => {
    class DependencyClass {}

    class TestService {
      constructor(@Inject(DependencyClass) dep: DependencyClass) {}
    }

    const tokens = getInjectedTokens(TestService);
    expect(tokens[0]).toBe(DependencyClass);
  });

  it("should return empty object when no injections", () => {
    class TestService {
      constructor() {}
    }

    const tokens = getInjectedTokens(TestService);
    expect(tokens).toEqual({});
  });

  it("should handle mixed injected and non-injected parameters", () => {
    const TOKEN = "custom-token";

    class NormalDependency {}

    class TestService {
      constructor(normal: NormalDependency, @Inject(TOKEN) custom: any) {}
    }

    const tokens = getInjectedTokens(TestService);
    expect(tokens[0]).toBeUndefined();
    expect(tokens[1]).toBe(TOKEN);
  });

  it("should not affect property decorators", () => {
    const TOKEN = "test-token";

    class TestService {
      constructor(@Inject(TOKEN) dep: any) {}

      method(@Inject(TOKEN) param: any) {
        // This should not be affected
      }
    }

    const tokens = getInjectedTokens(TestService);
    expect(tokens[0]).toBe(TOKEN);
    // Method parameter should be ignored
    expect(Object.keys(tokens).length).toBe(1);
  });
});
