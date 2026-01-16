import { BrowserWindow, type BrowserWindowConstructorOptions } from "electron";

export type TParamsRoute = {
  [key: string]: string;
};

export type TParamsCreateWindow<N = string> = {
  hash?: N;
  isCache?: boolean;
  paramsRoute?: TParamsRoute;
  options?: BrowserWindowConstructorOptions;
  loadURL?: string;
};

export type TCache = {
  [key in string]: BrowserWindow;
};
