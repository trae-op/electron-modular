import { BrowserWindow } from "electron";
import type { TParamsCreateWindow } from "../control-window/types.js";

export type TWindowCreate = (
  options?: TParamsCreateWindow
) => Promise<BrowserWindow | undefined>;

export type TWindowFactory = {
  create: TWindowCreate;
};
