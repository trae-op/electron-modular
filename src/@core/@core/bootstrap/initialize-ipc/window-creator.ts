import { BrowserWindow } from "electron";
import merge from "lodash.merge";
import { createWindow } from "../../control-window/create.js";
import type { TParamsCreateWindow } from "../../control-window/types.js";

export function createWindowWithParams<W extends TParamsCreateWindow>(
  baseMetadata: W,
  params?: W
): BrowserWindow {
  const mergedSettings =
    params !== undefined ? merge({}, baseMetadata, params) : baseMetadata;
  return createWindow(mergedSettings);
}
