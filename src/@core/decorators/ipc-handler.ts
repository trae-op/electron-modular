import "reflect-metadata/lite";

export const IpcHandler = (): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata("IpcHandler", true, target);
  };
};
