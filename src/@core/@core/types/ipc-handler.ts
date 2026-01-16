import { TWindowFactory } from "./window-factory.js";

export type TParamOnInit<N = string> = {
  getWindow: (name?: N) => TWindowFactory;
};

export type TIpcHandlerInterface = {
  onInit: (data: TParamOnInit) => void;
};
