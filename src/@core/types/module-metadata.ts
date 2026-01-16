import type { TIpcHandlerInterface } from "./ipc-handler.js";
import type { Constructor } from "./constructor.js";
import type { TProvider, TProviderToken } from "./provider.js";

export type RgModuleMetadata = {
  imports?: Constructor[];
  ipc?: (new (...args: any[]) => TIpcHandlerInterface)[];
  windows?: Constructor[];
  providers?: TProvider[];
  exports?: TProviderToken[];
};
