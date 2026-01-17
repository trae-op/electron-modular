import type { BrowserWindow } from "electron";
import { cacheWindows } from "./cache.js";

export const getWindow = <N extends string>(
  name: N,
): BrowserWindow | undefined => {
  const win = cacheWindows.get(name);

  if (!win || typeof win === "boolean" || win.isDestroyed()) {
    return undefined;
  }

  return win;
};
