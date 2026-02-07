/**
 * @fileoverview Central export point for all type definitions.
 *
 * Re-exports all types used in the dependency injection and window management system.
 *
 * @module @core/types
 */

export type { Constructor } from "./constructor.js";
export type { TIpcHandlerInterface, TParamOnInit } from "./ipc-handler.js";
export type { RgModuleMetadata } from "./module-metadata.js";
export type {
  TProviderToken,
  TClassProvider,
  TFactoryProvider,
  TValueProvider,
  TExistingProvider,
  TProvider,
} from "./provider.js";
export type { TWindowFactory, TWindowCreate } from "./window-factory.js";
export type {
  WindowManagerOptions,
  TWindowManagerWithHandlers,
} from "./window-manager.js";
export type { TMetadataWindow } from "./window-metadata.js";
