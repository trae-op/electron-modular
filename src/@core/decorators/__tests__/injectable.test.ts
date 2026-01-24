import { describe, it, expect } from "vitest";
import { Injectable } from "../injectable.js";
import "reflect-metadata/lite";

describe("Injectable decorator", () => {
  it("should mark class as injectable", () => {
    @Injectable()
    class TestService {}

    const metadata = Reflect.getMetadata("Injectable", TestService);
    expect(metadata).toBe(true);
  });

  it("should work with multiple classes", () => {
    @Injectable()
    class ServiceA {}

    @Injectable()
    class ServiceB {}

    expect(Reflect.getMetadata("Injectable", ServiceA)).toBe(true);
    expect(Reflect.getMetadata("Injectable", ServiceB)).toBe(true);
  });

  it("should not affect classes without decorator", () => {
    class NonInjectableService {}

    const metadata = Reflect.getMetadata("Injectable", NonInjectableService);
    expect(metadata).toBeUndefined();
  });

  it("should work with class that has constructor parameters", () => {
    @Injectable()
    class ServiceWithDeps {
      constructor(
        public dep1: string,
        public dep2: number,
      ) {}
    }

    const metadata = Reflect.getMetadata("Injectable", ServiceWithDeps);
    expect(metadata).toBe(true);
  });

  it("should work with class inheritance", () => {
    @Injectable()
    class BaseService {}

    @Injectable()
    class DerivedService extends BaseService {}

    expect(Reflect.getMetadata("Injectable", BaseService)).toBe(true);
    expect(Reflect.getMetadata("Injectable", DerivedService)).toBe(true);
  });
});
