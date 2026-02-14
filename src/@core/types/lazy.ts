/**
 * @fileoverview Lazy loading type definitions for modules.
 *
 * Defines configuration and response types for lazy-loaded modules.
 * Lazy modules are not initialized during bootstrapModules() but instead
 * register an IPC handler that triggers initialization on first invocation.
 *
 * @module @core/types/lazy
 */

/**
 * Configuration for lazy loading a module.
 *
 * When specified in @RgModule metadata, the module will not be initialized
 * during bootstrapModules(). Instead, an ipcMain.handle() listener is
 * registered using the trigger string as the channel name.
 *
 * @property enabled - Must be true to enable lazy loading
 * @property trigger - IPC channel name that triggers module initialization
 *
 * @example
 * ```typescript
 * @RgModule({
 *   providers: [AnalyticsService],
 *   ipc: [AnalyticsIpc],
 *   lazy: {
 *     enabled: true,
 *     trigger: "analytics",
 *   },
 * })
 * export class AnalyticsModule {}
 * ```
 */
export type TLazyConfig = {
  enabled: true;
  trigger: string;
};

/**
 * Response returned when a lazy module's IPC trigger is invoked.
 *
 * @property initialized - Whether the module was successfully initialized
 * @property name - The trigger name of the lazy module
 * @property error - Error details if initialization failed
 */
export type TLazyModuleResponse = {
  initialized: boolean;
  name: string;
  error?: {
    message: string;
  };
};
