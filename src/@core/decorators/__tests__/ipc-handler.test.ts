import { describe, it, expect } from "vitest";
import { IpcHandler } from "../ipc-handler.js";
import "reflect-metadata/lite";

describe("IpcHandler decorator", () => {
  it("should mark class as IPC handler", () => {
    @IpcHandler()
    class TestHandler {}

    const metadata = Reflect.getMetadata("IpcHandler", TestHandler);
    expect(metadata).toBe(true);
  });

  it("should work with multiple handlers", () => {
    @IpcHandler()
    class Handler1 {}

    @IpcHandler()
    class Handler2 {}

    expect(Reflect.getMetadata("IpcHandler", Handler1)).toBe(true);
    expect(Reflect.getMetadata("IpcHandler", Handler2)).toBe(true);
  });

  it("should not affect classes without decorator", () => {
    class NonHandler {}

    const metadata = Reflect.getMetadata("IpcHandler", NonHandler);
    expect(metadata).toBeUndefined();
  });

  it("should work with class that has methods", () => {
    @IpcHandler()
    class TestHandler {
      handleEvent() {
        return "handled";
      }
    }

    const metadata = Reflect.getMetadata("IpcHandler", TestHandler);
    expect(metadata).toBe(true);
  });

  it("should work with class that has constructor", () => {
    @IpcHandler()
    class TestHandler {
      constructor(private dependency: any) {}

      handle() {
        return this.dependency;
      }
    }

    const metadata = Reflect.getMetadata("IpcHandler", TestHandler);
    expect(metadata).toBe(true);
  });
});
