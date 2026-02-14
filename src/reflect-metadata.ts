type TMetadataStore = Map<PropertyKey | undefined, Map<unknown, unknown>>;

const targetMetadataStore = new WeakMap<object, TMetadataStore>();

const getOrCreatePropertyMetadata = (
  target: object,
  propertyKey?: PropertyKey,
): Map<unknown, unknown> => {
  let propertiesMetadata = targetMetadataStore.get(target);

  if (propertiesMetadata === undefined) {
    propertiesMetadata = new Map<
      PropertyKey | undefined,
      Map<unknown, unknown>
    >();
    targetMetadataStore.set(target, propertiesMetadata);
  }

  let propertyMetadata = propertiesMetadata.get(propertyKey);

  if (propertyMetadata === undefined) {
    propertyMetadata = new Map<unknown, unknown>();
    propertiesMetadata.set(propertyKey, propertyMetadata);
  }

  return propertyMetadata;
};

const getPropertyMetadata = (
  target: object,
  propertyKey?: PropertyKey,
): Map<unknown, unknown> | undefined => {
  return targetMetadataStore.get(target)?.get(propertyKey);
};

if (Reflect.defineMetadata === undefined) {
  Reflect.defineMetadata = (
    metadataKey: unknown,
    metadataValue: unknown,
    target: object,
    propertyKey?: PropertyKey,
  ): void => {
    const propertyMetadata = getOrCreatePropertyMetadata(target, propertyKey);
    propertyMetadata.set(metadataKey, metadataValue);
  };
}

if (Reflect.getOwnMetadata === undefined) {
  Reflect.getOwnMetadata = (
    metadataKey: unknown,
    target: object,
    propertyKey?: PropertyKey,
  ): unknown => {
    return getPropertyMetadata(target, propertyKey)?.get(metadataKey);
  };
}

if (Reflect.getMetadata === undefined) {
  Reflect.getMetadata = (
    metadataKey: unknown,
    target: object,
    propertyKey?: PropertyKey,
  ): unknown => {
    let currentTarget: object | null = target;

    while (currentTarget !== null) {
      const metadataValue = Reflect.getOwnMetadata(
        metadataKey,
        currentTarget,
        propertyKey,
      );

      if (metadataValue !== undefined) {
        return metadataValue;
      }

      currentTarget = Object.getPrototypeOf(currentTarget);
    }

    return undefined;
  };
}

if (Reflect.hasOwnMetadata === undefined) {
  Reflect.hasOwnMetadata = (
    metadataKey: unknown,
    target: object,
    propertyKey?: PropertyKey,
  ): boolean => {
    return getPropertyMetadata(target, propertyKey)?.has(metadataKey) ?? false;
  };
}

if (Reflect.hasMetadata === undefined) {
  Reflect.hasMetadata = (
    metadataKey: unknown,
    target: object,
    propertyKey?: PropertyKey,
  ): boolean => {
    let currentTarget: object | null = target;

    while (currentTarget !== null) {
      if (Reflect.hasOwnMetadata(metadataKey, currentTarget, propertyKey)) {
        return true;
      }

      currentTarget = Object.getPrototypeOf(currentTarget);
    }

    return false;
  };
}

if (Reflect.metadata === undefined) {
  Reflect.metadata = (
    metadataKey: unknown,
    metadataValue: unknown,
  ): ClassDecorator & PropertyDecorator => {
    return (target: object, propertyKey?: string | symbol): void => {
      Reflect.defineMetadata(metadataKey, metadataValue, target, propertyKey);
    };
  };
}

declare global {
  namespace Reflect {
    function defineMetadata(
      metadataKey: unknown,
      metadataValue: unknown,
      target: object,
      propertyKey?: PropertyKey,
    ): void;
    function getOwnMetadata(
      metadataKey: unknown,
      target: object,
      propertyKey?: PropertyKey,
    ): unknown;
    function getMetadata(
      metadataKey: unknown,
      target: object,
      propertyKey?: PropertyKey,
    ): unknown;
    function hasOwnMetadata(
      metadataKey: unknown,
      target: object,
      propertyKey?: PropertyKey,
    ): boolean;
    function hasMetadata(
      metadataKey: unknown,
      target: object,
      propertyKey?: PropertyKey,
    ): boolean;
    function metadata(
      metadataKey: unknown,
      metadataValue: unknown,
    ): ClassDecorator & PropertyDecorator;
  }
}

export {};
