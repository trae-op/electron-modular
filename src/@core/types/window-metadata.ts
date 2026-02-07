/**
 * @fileoverview Window metadata type definition.
 *
 * Defines the structure of window metadata stored in the container.
 *
 * @module @core/types/window-metadata
 */

import type { TParamsCreateWindow } from "../control-window/types.js";
import type { Constructor } from "./constructor.js";

/**
 * Metadata for a registered window manager.
 *
 * Combines window configuration with the window manager class constructor.
 * This is stored in the container and used to create window factories.
 */
export type TMetadataWindow = {
  metadata: TParamsCreateWindow;
  windowClass: Constructor;
};
