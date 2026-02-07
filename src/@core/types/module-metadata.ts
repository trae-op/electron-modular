/**
 * @fileoverview Module metadata type definition.
 *
 * Defines the structure of metadata attached to modules by the @RgModule decorator.
 *
 * @module @core/types/module-metadata
 */

import type { TIpcHandlerInterface } from "./ipc-handler.js";
import type { Constructor } from "./constructor.js";
import type { TProvider, TProviderToken } from "./provider.js";

/**
 * Metadata for a module decorated with @RgModule.
 *
 * @property imports - Modules to import and make their exports available
 * @property ipc - IPC handler classes to initialize
 * @property windows - Window manager classes to register
 * @property providers - Services and factories available in this module
 * @property exports - Providers to make available to importing modules
 */
export type RgModuleMetadata = {
  imports?: Constructor[];
  ipc?: (new (...args: any[]) => TIpcHandlerInterface)[];
  windows?: Constructor[];
  providers?: TProvider[];
  exports?: TProviderToken[];
};
