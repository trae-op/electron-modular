import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import type { RgModuleMetadata } from "../../src/@core/types/module-metadata.js";
import { container } from "../../src/@core/container.js";
import { registerProviders } from "../../src/@core/bootstrap/register-providers.js";
import { InvalidProviderError } from "../../src/@core/errors/index.js";

describe("registerProviders", () => {
  let TestModule: any;
  const modules: any[] = [];

  beforeEach(() => {
    TestModule = class TestModule {};
    container.addModule(TestModule, { providers: [], exports: [] });
    modules.push(TestModule);
  });

  afterEach(() => {
    // Clean up modules (note: can't truly reset global container, but tests are isolated enough)
  });

  it("should register class providers", async () => {
    class ServiceA {}
    class ServiceB {}

    const metadata: RgModuleMetadata = {
      providers: [ServiceA, ServiceB],
    };

    // Mock container.addProvider
    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerProviders(TestModule, metadata);

    expect(addProviderSpy).toHaveBeenCalledWith(TestModule, ServiceA);
    expect(addProviderSpy).toHaveBeenCalledWith(TestModule, ServiceB);
    expect(addProviderSpy).toHaveBeenCalledTimes(2);

    addProviderSpy.mockRestore();
  });

  it("should register provider objects", async () => {
    const metadata: RgModuleMetadata = {
      providers: [
        {
          provide: "config",
          useValue: { apiUrl: "https://api.example.com" },
        },
      ],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerProviders(TestModule, metadata);

    expect(addProviderSpy).toHaveBeenCalledWith(
      TestModule,
      "config",
      metadata.providers![0],
    );
  });

  it("should handle factory providers", async () => {
    const factoryProvider = {
      provide: "factory",
      useFactory: () => ({ value: "test" }),
    };

    const metadata: RgModuleMetadata = {
      providers: [factoryProvider],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerProviders(TestModule, metadata);

    expect(addProviderSpy).toHaveBeenCalledWith(
      TestModule,
      "factory",
      factoryProvider,
    );
  });

  it("should handle class providers with dependencies", async () => {
    class DependencyA {}
    class ServiceB {}

    const classProvider = {
      provide: ServiceB,
      useClass: ServiceB,
      inject: [DependencyA],
    };

    const metadata: RgModuleMetadata = {
      providers: [classProvider],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerProviders(TestModule, metadata);

    expect(addProviderSpy).toHaveBeenCalledWith(
      TestModule,
      ServiceB,
      classProvider,
    );
  });

  it("should handle existing providers (aliases)", async () => {
    class ServiceA {}

    const existingProvider = {
      provide: "service-alias",
      useExisting: ServiceA,
    };

    const metadata: RgModuleMetadata = {
      providers: [existingProvider],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerProviders(TestModule, metadata);

    expect(addProviderSpy).toHaveBeenCalledWith(
      TestModule,
      "service-alias",
      existingProvider,
    );
  });

  it("should handle mixed provider types", async () => {
    class ServiceA {}

    const metadata: RgModuleMetadata = {
      providers: [
        ServiceA,
        { provide: "config", useValue: { env: "test" } },
        { provide: "factory", useFactory: () => ({ value: 42 }) },
      ],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerProviders(TestModule, metadata);

    expect(addProviderSpy).toHaveBeenCalledTimes(3);
  });

  it("should do nothing when no providers", async () => {
    const metadata: RgModuleMetadata = {};

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerProviders(TestModule, metadata);

    expect(addProviderSpy).not.toHaveBeenCalled();
  });

  it("should do nothing when providers array is empty", async () => {
    const metadata: RgModuleMetadata = {
      providers: [],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerProviders(TestModule, metadata);

    expect(addProviderSpy).not.toHaveBeenCalled();
  });

  it("should throw for invalid provider", async () => {
    const metadata: RgModuleMetadata = {
      providers: [123 as any], // Invalid provider
    };

    await expect(registerProviders(TestModule, metadata)).rejects.toThrow(
      InvalidProviderError,
    );
  });

  it("should throw for invalid provider object", async () => {
    const metadata: RgModuleMetadata = {
      providers: [{ invalid: true } as any], // No 'provide' property
    };

    await expect(registerProviders(TestModule, metadata)).rejects.toThrow(
      InvalidProviderError,
    );
  });

  it("should handle string tokens", async () => {
    const metadata: RgModuleMetadata = {
      providers: [
        {
          provide: "database-url",
          useValue: "mongodb://localhost:27017",
        },
      ],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerProviders(TestModule, metadata);

    expect(addProviderSpy).toHaveBeenCalledWith(
      TestModule,
      "database-url",
      metadata.providers![0],
    );
  });

  it("should handle symbol tokens", async () => {
    const TOKEN = Symbol("custom-token");

    const metadata: RgModuleMetadata = {
      providers: [
        {
          provide: TOKEN,
          useValue: { data: "test" },
        },
      ],
    };

    const addProviderSpy = vi.spyOn(container, "addProvider");

    await registerProviders(TestModule, metadata);

    expect(addProviderSpy).toHaveBeenCalledWith(
      TestModule,
      TOKEN,
      metadata.providers![0],
    );
  });
});
