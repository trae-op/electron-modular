import { describe, it, expect, beforeEach, vi } from "vitest";
import { registerProviders } from "../register-providers.js";
import { InvalidProviderError } from "../../errors/index.js";
import { container } from "../../container.js";
import "reflect-metadata/lite";

describe("registerProviders", () => {
  let TestModule: any;

  beforeEach(() => {
    TestModule = class TestModule {};
    container.addModule(TestModule, { providers: [] });
  });

  it("should return early if no providers in metadata", async () => {
    const metadata = {};

    await expect(
      registerProviders(TestModule, metadata),
    ).resolves.toBeUndefined();
  });

  it("should register class constructor providers", async () => {
    class ServiceA {}
    class ServiceB {}

    const metadata = {
      providers: [ServiceA, ServiceB],
    };

    await registerProviders(TestModule, metadata);

    const providerA = container.getProvider(TestModule, ServiceA);
    const providerB = container.getProvider(TestModule, ServiceB);

    expect(providerA).toBe(ServiceA);
    expect(providerB).toBe(ServiceB);
  });

  it("should register value providers", async () => {
    const valueProvider = {
      provide: "CONFIG",
      useValue: { key: "value" },
    };

    const metadata = {
      providers: [valueProvider],
    };

    await registerProviders(TestModule, metadata);

    const provider = container.getProvider(TestModule, "CONFIG");
    expect(provider).toBe(valueProvider);
  });

  it("should register factory providers", async () => {
    const factoryProvider = {
      provide: "FACTORY",
      useFactory: () => ({ created: true }),
    };

    const metadata = {
      providers: [factoryProvider],
    };

    await registerProviders(TestModule, metadata);

    const provider = container.getProvider(TestModule, "FACTORY");
    expect(provider).toBe(factoryProvider);
  });

  it("should register class providers", async () => {
    class Implementation {}

    const classProvider = {
      provide: "INTERFACE",
      useClass: Implementation,
    };

    const metadata = {
      providers: [classProvider],
    };

    await registerProviders(TestModule, metadata);

    const provider = container.getProvider(TestModule, "INTERFACE");
    expect(provider).toBe(classProvider);
  });

  it("should register existing providers", async () => {
    const existingProvider = {
      provide: "ALIAS",
      useExisting: "ORIGINAL",
    };

    const metadata = {
      providers: [existingProvider],
    };

    await registerProviders(TestModule, metadata);

    const provider = container.getProvider(TestModule, "ALIAS");
    expect(provider).toBe(existingProvider);
  });

  it("should register mixed provider types", async () => {
    class ServiceClass {}

    const valueProvider = {
      provide: "VALUE",
      useValue: "test",
    };

    const metadata = {
      providers: [ServiceClass, valueProvider],
    };

    await registerProviders(TestModule, metadata);

    expect(container.getProvider(TestModule, ServiceClass)).toBe(ServiceClass);
    expect(container.getProvider(TestModule, "VALUE")).toBe(valueProvider);
  });

  it("should throw InvalidProviderError for invalid provider", async () => {
    const metadata = {
      providers: ["invalid" as any],
    };

    await expect(registerProviders(TestModule, metadata)).rejects.toThrow(
      InvalidProviderError,
    );
  });

  it("should throw InvalidProviderError for null provider", async () => {
    const metadata = {
      providers: [null as any],
    };

    await expect(registerProviders(TestModule, metadata)).rejects.toThrow(
      InvalidProviderError,
    );
  });

  it("should throw InvalidProviderError for object without provide property", async () => {
    const metadata = {
      providers: [{ someKey: "value" } as any],
    };

    await expect(registerProviders(TestModule, metadata)).rejects.toThrow(
      InvalidProviderError,
    );
  });

  it("should handle empty providers array", async () => {
    const metadata = {
      providers: [],
    };

    await expect(
      registerProviders(TestModule, metadata),
    ).resolves.toBeUndefined();
  });

  it("should register symbol tokens", async () => {
    const TOKEN = Symbol("test");

    const provider = {
      provide: TOKEN,
      useValue: "test-value",
    };

    const metadata = {
      providers: [provider],
    };

    await registerProviders(TestModule, metadata);

    const registered = container.getProvider(TestModule, TOKEN);
    expect(registered).toBe(provider);
  });
});
