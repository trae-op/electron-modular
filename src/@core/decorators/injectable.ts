/**
 * @fileoverview @Injectable decorator for marking classes as injectable services.
 *
 * Classes decorated with @Injectable can be:
 * - Registered as providers in modules
 * - Automatically instantiated by the DI container
 * - Injected into other services
 *
 * @module @core/decorators/injectable
 */

import "../../reflect-metadata.js";

/**
 * Decorator that marks a class as injectable into the DI container.
 *
 * The container will automatically resolve constructor dependencies
 * when instantiating this class.
 *
 * @returns ClassDecorator function
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   constructor(private restApiService: RestApiService) {}
 * }
 * ```
 */
export const Injectable = (): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata("Injectable", true, target);
  };
};
