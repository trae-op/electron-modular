import "reflect-metadata/lite";
import { RgModuleMetadata } from "../types/module-metadata.js";

export function RgModule(options: RgModuleMetadata): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata("RgModule", options, target);
  };
}
