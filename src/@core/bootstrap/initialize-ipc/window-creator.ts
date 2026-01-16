import { BrowserWindow } from "electron";
import { createWindow } from "../../control-window/create.js";
import type { TParamsCreateWindow } from "../../control-window/types.js";

type TPlainObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is TPlainObject => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
};

const mergeDeep = <T extends TPlainObject>(target: T, source: T): T => {
  const output: TPlainObject = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value)) {
      const current = output[key];
      output[key] = isPlainObject(current)
        ? mergeDeep(current, value)
        : mergeDeep({}, value);
      continue;
    }

    output[key] = value;
  }

  return output as T;
};

export function createWindowWithParams<W extends TParamsCreateWindow>(
  baseMetadata: W,
  params?: W,
): BrowserWindow {
  const mergedSettings =
    params !== undefined
      ? mergeDeep(baseMetadata as TPlainObject, params as TPlainObject)
      : baseMetadata;
  return createWindow(mergedSettings);
}
