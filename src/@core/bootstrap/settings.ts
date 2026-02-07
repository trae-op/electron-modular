/**
 * @fileoverview Application settings management.
 *
 * Provides functions to initialize and retrieve application-wide settings including:
 * - CSP (Content Security Policy) connect sources
 * - Localhost port for development
 * - Build output folder paths
 *
 * Settings must be initialized before modules are bootstrapped.
 *
 * @module @core/bootstrap/settings
 */

import { SettingsNotInitializedError } from "../errors/index.js";

/**
 * Folder configuration for build outputs.
 */
export type TFolderSettings = {
  distRenderer: string;
  distMain: string;
};

/**
 * Application-wide settings configuration.
 */
export type TSettings = {
  cspConnectSources?: string[];
  localhostPort: string;
  folders: TFolderSettings;
};

/** Key for storing settings in the internal map */
const KEY = "settings" as const;

/** Internal settings storage */
const settings = new Map<typeof KEY, TSettings>();

/**
 * Initializes application settings.
 *
 * Must be called before bootstrapping modules. Settings are stored globally
 * and used throughout the application lifecycle.
 *
 * @param options - Application settings configuration
 *
 * @example
 * ```typescript
 * initSettings({
 *   cspConnectSources: ['https://api.example.com'],
 *   localhostPort: '3000',
 *   folders: {
 *     distRenderer: 'dist-renderer',
 *     distMain: 'dist-main'
 *   }
 * });
 * ```
 */
export const initSettings = (options: TSettings): void => {
  settings.set(KEY, options);
};

/**
 * Retrieves the current application settings.
 *
 * @returns The application settings
 * @throws {SettingsNotInitializedError} If settings haven't been initialized
 */
export const getSettings = (): TSettings => {
  const cachedSettings = settings.get(KEY);

  if (!cachedSettings) {
    throw new SettingsNotInitializedError();
  }

  return cachedSettings;
};
