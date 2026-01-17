import { describe, expect, it, beforeEach } from "vitest";
import { getDependencyTokens } from "../../src/@core/utils/dependency-tokens.js";
import { Inject } from "../../src/@core/decorators/inject.js";

describe("getDependencyTokens", () => {
  it("should return empty array for class with no parameters", () => {
    class ServiceWithoutDeps {}

    const tokens = getDependencyTokens(ServiceWithoutDeps);
    expect(tokens).toEqual([]);
  });

  it("should extract parameter types using @Inject decorator", () => {
    class DependencyA {}
    class DependencyB {}

    class ServiceWithDeps {
      constructor(
        @Inject(DependencyA) depA: DependencyA,
        @Inject(DependencyB) depB: DependencyB,
      ) {}
    }

    const tokens = getDependencyTokens(ServiceWithDeps);
    expect(tokens).toHaveLength(2);
    expect(tokens[0]).toBe(DependencyA);
    expect(tokens[1]).toBe(DependencyB);
  });

  it("should prioritize @Inject decorator over default params", () => {
    const CUSTOM_TOKEN = "custom-token";
    class DependencyA {}
    class DependencyB {}

    class ServiceWithMixedDeps {
      constructor(
        @Inject(CUSTOM_TOKEN) depA: any,
        @Inject(DependencyB) depB: DependencyB,
      ) {}
    }

    const tokens = getDependencyTokens(ServiceWithMixedDeps);
    expect(tokens[0]).toBe(CUSTOM_TOKEN);
    expect(tokens[1]).toBe(DependencyB);
  });

  it("should cache dependency tokens", () => {
    class DependencyA {}

    class TestService {
      constructor(dep: DependencyA) {}
    }

    const tokens1 = getDependencyTokens(TestService);
    const tokens2 = getDependencyTokens(TestService);

    expect(tokens1).toBe(tokens2); // Same reference = cached
  });

  it("should handle multiple injected tokens", () => {
    const TOKEN_A = Symbol("token-a");
    const TOKEN_B = "token-b";
    const TOKEN_C = Symbol("token-c");

    class TestService {
      constructor(
        @Inject(TOKEN_A) depA: any,
        @Inject(TOKEN_B) depB: any,
        @Inject(TOKEN_C) depC: any,
      ) {}
    }

    const tokens = getDependencyTokens(TestService);
    expect(tokens).toEqual([TOKEN_A, TOKEN_B, TOKEN_C]);
  });

  it("should handle sparse injections", () => {
    const CUSTOM_TOKEN = "custom";
    class DependencyA {}
    class DependencyB {}
    class DependencyC {}

    class TestService {
      constructor(
        @Inject(DependencyA) depA: DependencyA,
        @Inject(CUSTOM_TOKEN) depB: any,
        @Inject(DependencyC) depC: DependencyC,
      ) {}
    }

    const tokens = getDependencyTokens(TestService);
    expect(tokens[0]).toBe(DependencyA);
    expect(tokens[1]).toBe(CUSTOM_TOKEN);
    expect(tokens[2]).toBe(DependencyC);
  });

  it("should handle class with only injected parameters", () => {
    const TOKEN_A = "token-a";
    const TOKEN_B = "token-b";

    class TestService {
      constructor(@Inject(TOKEN_A) depA: any, @Inject(TOKEN_B) depB: any) {}
    }

    const tokens = getDependencyTokens(TestService);
    expect(tokens).toEqual([TOKEN_A, TOKEN_B]);
  });

  it("should return consistent results for the same class", () => {
    class DependencyA {}

    class TestService {
      constructor(dep: DependencyA) {}
    }

    const tokens1 = getDependencyTokens(TestService);
    const tokens2 = getDependencyTokens(TestService);
    const tokens3 = getDependencyTokens(TestService);

    expect(tokens1).toEqual(tokens2);
    expect(tokens2).toEqual(tokens3);
  });

  it("should handle different classes independently", () => {
    class DependencyA {}
    class DependencyB {}

    class ServiceA {
      constructor(@Inject(DependencyA) dep: DependencyA) {}
    }

    class ServiceB {
      constructor(@Inject(DependencyB) dep: DependencyB) {}
    }

    const tokensA = getDependencyTokens(ServiceA);
    const tokensB = getDependencyTokens(ServiceB);

    expect(tokensA[0]).toBe(DependencyA);
    expect(tokensB[0]).toBe(DependencyB);
  });

  it("should handle complex dependency chains", () => {
    const CONFIG_TOKEN = "config";
    class DatabaseService {}
    class CacheService {}

    class ComplexService {
      constructor(
        @Inject(CONFIG_TOKEN) config: any,
        @Inject(DatabaseService) db: DatabaseService,
        @Inject(CacheService) cache: CacheService,
      ) {}
    }

    const tokens = getDependencyTokens(ComplexService);
    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toBe(CONFIG_TOKEN);
    expect(tokens[1]).toBe(DatabaseService);
    expect(tokens[2]).toBe(CacheService);
  });
});
