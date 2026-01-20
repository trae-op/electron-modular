import { SettingsNotInitializedError } from "../errors/index.js";

export type TFolderSettings = {
  distRenderer: string;
  distMain: string;
};

export type TSettings = {
  baseRestApi?: string;
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
    throw new SettingsNotInitializedError();
  }

  return cachedSettings;
};
