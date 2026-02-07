/**
 * @fileoverview @IpcHandler decorator for marking IPC handler classes.
 *
 * Classes decorated with @IpcHandler:
 * - Are registered as providers in their module
 * - Have their onInit method called during module bootstrap
 * - Receive a getWindow function to access window factories
 *
 * @module @core/decorators/ipc-handler
 */

import "reflect-metadata/lite";

/**
 * Decorator that marks a class as an IPC handler.
 *
 * IPC handlers implement the TIpcHandlerInterface and typically:
 * - Set up ipcMain listeners
 * - Handle communication between main and renderer processes
 * - Access window factories to send messages to windows
 *
 * @returns ClassDecorator function
 *
 * @example
 * ```typescript
 * @IpcHandler()
 * export class UserIpc implements TIpcHandlerInterface {
 *   async onInit({ getWindow }: TParamOnInit) {
 *     ipcMain.on('user:fetch', async (event, userId) => {
 *       // Handle IPC message
 *     });
 *   }
 * }
 * ```
 */
export const IpcHandler = (): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata("IpcHandler", true, target);
  };
};
