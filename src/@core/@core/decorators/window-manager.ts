import { TParamsCreateWindow } from "../control-window/types.js";

export function WindowManager<P extends string>(
  options: TParamsCreateWindow<P>
): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata("WindowManager", options, target);
  };
}
