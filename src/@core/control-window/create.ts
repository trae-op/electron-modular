import { BrowserWindow, session, app } from "electron";
import path from "node:path";
import type { TParamsCreateWindow } from "./types.js";
import { cacheWindows } from "./cache.js";
import { getWindow } from "./receive.js";
import { getSettings } from "../bootstrap/settings.js";

const createContentSecurityPolicy = (
  baseRestApi: string,
  isDev: boolean,
): string => {
  const csp = `
    default-src 'self';
    connect-src 'self' ${baseRestApi};
    img-src * data:;
    style-src 'self' 'unsafe-inline';
    script-src 'self' ${isDev ? "'unsafe-inline'" : ""};
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  return csp;
};

const setupContentSecurityPolicy = (
  baseRestApi: string,
  isDev: boolean,
): void => {
  const csp = createContentSecurityPolicy(baseRestApi, isDev);

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [csp],
      },
    });
  });
};

const getAppPaths = (
  settings: ReturnType<typeof getSettings>,
  isDev: boolean,
) => {
  return {
    ui: path.join(
      app.getAppPath(),
      `/${settings.folders.distRenderer}/index.html`,
    ),
    preload: path.join(
      app.getAppPath(),
      isDev ? "." : "..",
      `/${settings.folders.distMain}/preload.cjs`,
    ),
  };
};

export const createWindow = <N extends string>({
  hash,
  options,
  isCache,
  loadURL,
}: TParamsCreateWindow<N>): BrowserWindow => {
  const settings = getSettings();
  const isDev = process.env.NODE_ENV === "development";
  const { ui: uiPath, preload: preloadPath } = getAppPaths(settings, isDev);

  if (!settings.baseRestApi) {
    console.warn(
      'Warning: You have to add an environment variable called "process.env.BASE_REST_API"!',
    );
  }

  if (!settings.localhostPort) {
    console.warn(
      'Warning: You have to add an environment variable called "process.env.LOCALHOST_ELECTRON_SERVER_PORT"!',
    );
  }

  if (hash && isCache) {
    const existingWindow = getWindow(hash);
    if (existingWindow) {
      existingWindow.show();
      return existingWindow;
    }
  }

  const newWindow = new BrowserWindow({
    ...options,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      ...options?.webPreferences,
    },
  });

  if (isCache && !loadURL) {
    setupContentSecurityPolicy(settings.baseRestApi, isDev);
  }

  if (loadURL) {
    newWindow.loadURL(loadURL);
  } else if (isDev) {
    newWindow.loadURL(
      `http://localhost:${settings.localhostPort}${hash ? `#${hash}` : ""}`,
    );
  } else if (hash) {
    newWindow.loadFile(uiPath, { hash });
  }

  if (hash && isCache) {
    cacheWindows.set(hash, newWindow);

    newWindow.on("close", (event) => {
      event.preventDefault();
      newWindow.hide();
    });
  }

  return newWindow;
};
