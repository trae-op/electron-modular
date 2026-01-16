import type { TParamsCreateWindow } from "../control-window/types.js";
import type { Constructor } from "./constructor.js";

export type TMetadataWindow = {
  metadata: TParamsCreateWindow;
  windowClass: Constructor;
};
