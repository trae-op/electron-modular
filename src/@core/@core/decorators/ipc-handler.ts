export function IpcHandler(): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata("IpcHandler", true, target);
  };
}
