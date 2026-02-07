/**
 * @fileoverview BrowserWindow creation and configuration.
 *
 * Handles creation of BrowserWindows with:
 * - Automatic preload script injection
 * - CSP (Content Security Policy) setup
 * - Window caching for performance
 * - Development vs production URL loading
 * - Hash-based routing support
 *
 * @module @core/control-window/create
 */

import { BrowserWindow, session, app } from "electron";
import path from "node:path";
import type { TParamsCreateWindow } from "./types.js";
import { cacheWindows } from "./cache.js";
import { getWindow } from "./receive.js";
import { getSettings } from "../bootstrap/settings.js";

/**
 * Sets up Content Security Policy for the default session.
 *
 * Configures CSP headers for all responses to enhance security by:
 * - Restricting resource loading to self and specified sources
 * - Allowing inline styles (needed for many UI frameworks)
 * - Conditionally allowing inline scripts in development
 *
 * @param sources - Additional connect-src sources from settings
 * @param dev - Whether running in development mode
 */
const setupCSP = (sources: string[], dev: boolean): void => {
  const connectSrc = sources.length > 0 ? ` ${sources.join(" ")}` : "";
  const csp =
    `default-src 'self'; connect-src 'self'${connectSrc}; img-src * data:; style-src 'self' 'unsafe-inline'; script-src 'self' ${dev ? "'unsafe-inline'" : ""};`
      .replace(/\s{2,}/g, " ")
      .trim();
  session.defaultSession.webRequest.onHeadersReceived((d, cb) => {
    cb({
      responseHeaders: {
        ...d.responseHeaders,
        "Content-Security-Policy": [csp],
      },
    });
  });
};

/**
 * Creates a BrowserWindow with automatic configuration.
 *
 * Features:
 * - Returns cached window if hash matches and isCache=true
 * - Sets up preload script from configured distMain folder
 * - Configures CSP for cached windows
 * - Loads development server URL or production file
 * - Hides instead of destroys cached windows on close
 *
 * @param params - Window creation parameters
 * @param params.hash - Unique window identifier (used for routing and caching)
 * @param params.options - BrowserWindowConstructorOptions to customize the window
 * @param params.isCache - Whether to cache this window instance
 * @param params.loadURL - Custom URL to load (overrides default behavior)
 * @returns Created or cached BrowserWindow instance
 *
 * @example
 * ```typescript
 * const window = createWindow({
 *   hash: 'window:main',
 *   isCache: true,
 *   options: { width: 800, height: 600 }
 * });
 * ```
 */
export const createWindow = <N extends string>({
  hash,
  options,
  isCache,
  loadURL,
}: TParamsCreateWindow<N>): BrowserWindow => {
  const settings = getSettings();
  const isDev = process.env.NODE_ENV === "development";
  const ui = path.join(
    app.getAppPath(),
    `/${settings.folders.distRenderer}/index.html`,
  );
  const preload = path.join(
    app.getAppPath(),
    isDev ? "." : "..",
    `/${settings.folders.distMain}/preload.cjs`,
  );

  if (!settings.localhostPort)
    console.warn(
      'Warning: You have to add an environment variable for example called "process.env.LOCALHOST_ELECTRON_SERVER_PORT"!',
    );

  if (hash && isCache) {
    const existing = getWindow(hash);
    if (existing) {
      existing.show();
      return existing;
    }
  }

  const win = new BrowserWindow({
    ...options,
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
      ...options?.webPreferences,
    },
  });

  if (isCache && !loadURL && settings.cspConnectSources)
    setupCSP(settings.cspConnectSources, isDev);

  if (loadURL) {
    win.loadURL(loadURL);
  } else if (isDev) {
    win.loadURL(
      `http://localhost:${settings.localhostPort}${hash ? `#${hash}` : ""}`,
    );
  } else if (hash) {
    win.loadFile(ui, { hash });
  }

  if (hash && isCache) {
    cacheWindows.set(hash, win);
    win.on("close", (e) => {
      e.preventDefault();
      win.hide();
    });
  }

  return win;
};
