import "reflect-metadata/lite";

export const Injectable = (): ClassDecorator => {
  return (target: Function) => {
    Reflect.defineMetadata("Injectable", true, target);
  };
};
