import "reflect-metadata/lite";
import type { RgModuleMetadata } from "../types/module-metadata.js";

export const RgModule = (options: RgModuleMetadata): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata("RgModule", options, target);
  };
};
