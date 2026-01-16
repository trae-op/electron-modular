import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  type Event,
  type WebContentsWillRedirectEventParams,
} from "electron";
import type { TParamsCreateWindow } from "../control-window/types.js";

export type WindowManagerOptions = TParamsCreateWindow & {
  options: BrowserWindowConstructorOptions;
};

type TWindowEventHandler = (...args: any[]) => void;

export type TWindowManagerWithHandlers = {
  [key: `on${string}`]: TWindowEventHandler | undefined;
};
