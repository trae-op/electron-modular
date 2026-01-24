import { describe, it, expect, beforeEach, vi } from "vitest";
import { getDependencyTokens } from "../dependency-tokens.js";
import { Inject } from "../../decorators/inject.js";
import "reflect-metadata/lite";

describe("getDependencyTokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty array for class with no constructor parameters", () => {
    class NoParams {}

    const tokens = getDependencyTokens(NoParams);
    expect(tokens).toEqual([]);
  });

  it("should return design:paramtypes when available", () => {
    class Dependency {}
    class ServiceWithDeps {
      constructor(public dep: Dependency) {}
    }

    // Manually set metadata for testing since TypeScript compiler isn't running
    Reflect.defineMetadata("design:paramtypes", [Dependency], ServiceWithDeps);

    const tokens = getDependencyTokens(ServiceWithDeps);
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toBe(Dependency);
  });

  it("should return multiple parameter types", () => {
    class Dep1 {}
    class Dep2 {}
    class Dep3 {}

    class ServiceWithMultipleDeps {
      constructor(
        public dep1: Dep1,
        public dep2: Dep2,
        public dep3: Dep3,
      ) {}
    }

    Reflect.defineMetadata(
      "design:paramtypes",
      [Dep1, Dep2, Dep3],
      ServiceWithMultipleDeps,
    );

    const tokens = getDependencyTokens(ServiceWithMultipleDeps);
    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toBe(Dep1);
    expect(tokens[1]).toBe(Dep2);
    expect(tokens[2]).toBe(Dep3);
  });

  it("should override with @Inject decorator tokens", () => {
    const CUSTOM_TOKEN = Symbol("custom");
    class DefaultDep {}

    class ServiceWithInjectedToken {
      constructor(@Inject(CUSTOM_TOKEN) public dep: DefaultDep) {}
    }

    Reflect.defineMetadata(
      "design:paramtypes",
      [DefaultDep],
      ServiceWithInjectedToken,
    );

    const tokens = getDependencyTokens(ServiceWithInjectedToken);
    expect(tokens[0]).toBe(CUSTOM_TOKEN);
  });

  it("should handle mixed injected and non-injected parameters", () => {
    const TOKEN1 = Symbol("token1");
    const TOKEN3 = Symbol("token3");
    class Dep2 {}

    class MixedService {
      constructor(
        @Inject(TOKEN1) public dep1: any,
        public dep2: Dep2,
        @Inject(TOKEN3) public dep3: any,
      ) {}
    }

    Reflect.defineMetadata(
      "design:paramtypes",
      [Object, Dep2, Object],
      MixedService,
    );

    const tokens = getDependencyTokens(MixedService);
    expect(tokens[0]).toBe(TOKEN1);
    expect(tokens[1]).toBe(Dep2);
    expect(tokens[2]).toBe(TOKEN3);
  });

  it("should handle string tokens from @Inject", () => {
    const STRING_TOKEN = "MyStringToken";

    class ServiceWithStringToken {
      constructor(@Inject(STRING_TOKEN) public dep: any) {}
    }

    const tokens = getDependencyTokens(ServiceWithStringToken);
    expect(tokens[0]).toBe(STRING_TOKEN);
  });

  it("should cache results for same constructor", () => {
    class Dependency {}

    class CachedService {
      constructor(public dep: Dependency) {}
    }

    Reflect.defineMetadata("design:paramtypes", [Dependency], CachedService);

    const tokens1 = getDependencyTokens(CachedService);
    const tokens2 = getDependencyTokens(CachedService);

    expect(tokens1).toBe(tokens2);
  });

  it("should handle class with no design:paramtypes metadata", () => {
    class NoMetadata {
      constructor() {}
    }

    const tokens = getDependencyTokens(NoMetadata);
    expect(tokens).toEqual([]);
  });

  it("should calculate maxIndex correctly when injected index exceeds paramTypes", () => {
    const TOKEN = Symbol("token");

    class EdgeCaseService {
      constructor(@Inject(TOKEN) public dep: any) {}
    }

    const tokens = getDependencyTokens(EdgeCaseService);
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens[0]).toBe(TOKEN);
  });

  it("should handle multiple calls with different classes", () => {
    class Dep1 {}
    class Dep2 {}

    class Service1 {
      constructor(public dep: Dep1) {}
    }

    class Service2 {
      constructor(public dep: Dep2) {}
    }

    Reflect.defineMetadata("design:paramtypes", [Dep1], Service1);
    Reflect.defineMetadata("design:paramtypes", [Dep2], Service2);

    const tokens1 = getDependencyTokens(Service1);
    const tokens2 = getDependencyTokens(Service2);

    expect(tokens1[0]).toBe(Dep1);
    expect(tokens2[0]).toBe(Dep2);
  });
});
