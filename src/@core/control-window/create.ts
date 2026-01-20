import { BrowserWindow, session, app } from "electron";
import path from "node:path";
import type { TParamsCreateWindow } from "./types.js";
import { cacheWindows } from "./cache.js";
import { getWindow } from "./receive.js";
import { getSettings } from "../bootstrap/settings.js";

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
      'Warning: You have to add an environment variable called "process.env.LOCALHOST_ELECTRON_SERVER_PORT"!',
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
