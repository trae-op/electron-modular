export function Injectable(): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata("Injectable", true, target);
  };
}
