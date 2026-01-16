import { describe, expect, it } from "vitest";
import { Container } from "../src/@core/container.js";

class ConfigService {
  public readonly value = "ok";
}

class FeatureService {
  constructor(public readonly config: ConfigService) {}
}

const TestModule = class TestModule {};

describe("Container", () => {
  it("resolves class providers with injected dependencies", async () => {
    const container = new Container();

    container.addModule(TestModule, { exports: [], providers: [] });
    container.setModuleMetadata(TestModule, { providers: [], exports: [] });

    container.addProvider(TestModule, ConfigService);
    container.addProvider(TestModule, FeatureService, {
      provide: FeatureService,
      useClass: FeatureService,
      inject: [ConfigService],
    });

    const instance = await container.resolve(TestModule, FeatureService);

    expect(instance).toBeDefined();
    expect(instance?.config).toBeInstanceOf(ConfigService);
    expect(instance?.config.value).toBe("ok");
  });
});
