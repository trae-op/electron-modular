export type TFolderSettings = {
  distRenderer: string;
  distMain: string;
};

export type TSettings = {
  baseRestApi: string;
  localhostPort: string;
  folders: TFolderSettings;
};

const KEY = "settings" as const;
const settings = new Map<typeof KEY, TSettings>();

export const initSettings = (options: TSettings): void => {
  settings.set(KEY, options);
};

export const getSettings = (): TSettings => {
  const cachedSettings = settings.get(KEY);
  if (!cachedSettings) {
    throw new Error("App settings cache has not been initialized.");
  }

  return cachedSettings;
};
