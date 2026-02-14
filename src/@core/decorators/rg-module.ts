/**
 * @fileoverview @RgModule decorator for defining application modules.
 *
 * The @RgModule decorator marks a class as a module and attaches metadata defining:
 * - Imported modules
 * - Providers (services and factories)
 * - IPC handlers
 * - Window managers
 * - Exported providers
 *
 * @module @core/decorators/rg-module
 */

import "../../reflect-metadata.js";
import type { RgModuleMetadata } from "../types/module-metadata.js";

/**
 * Decorator that marks a class as a module and attaches module metadata.
 *
 * @param options - Module configuration including imports, providers, IPC, windows, and exports
 * @returns ClassDecorator function
 *
 * @example
 * ```typescript
 * @RgModule({
 *   imports: [RestApiModule],
 *   providers: [UserService],
 *   ipc: [UserIpc],
 *   windows: [UserWindow],
 *   exports: [UserService]
 * })
 * export class UserModule {}
 * ```
 */
export const RgModule = (options: RgModuleMetadata): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata("RgModule", options, target);
  };
};
