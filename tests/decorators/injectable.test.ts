import { describe, expect, it, beforeEach } from "vitest";
import { Injectable } from "../../src/@core/decorators/injectable.js";

describe("@Injectable Decorator", () => {
  it("should add metadata to the class", () => {
    @Injectable()
    class TestService {}

    const metadata = Reflect.getMetadata("Injectable", TestService);

    expect(metadata).toBe(true);
  });

  it("should work with multiple decorated classes", () => {
    @Injectable()
    class ServiceA {}

    @Injectable()
    class ServiceB {}

    expect(Reflect.getMetadata("Injectable", ServiceA)).toBe(true);
    expect(Reflect.getMetadata("Injectable", ServiceB)).toBe(true);
  });

  it("should not interfere with class functionality", () => {
    @Injectable()
    class TestService {
      getValue() {
        return "test-value";
      }
    }

    const instance = new TestService();
    expect(instance.getValue()).toBe("test-value");
  });

  it("should work with constructor parameters", () => {
    class ConfigService {
      value = "config";
    }

    @Injectable()
    class TestService {
      constructor(public config: ConfigService) {}
    }

    const metadata = Reflect.getMetadata("Injectable", TestService);
    expect(metadata).toBe(true);

    const config = new ConfigService();
    const instance = new TestService(config);
    expect(instance.config.value).toBe("config");
  });
});
