import { BrowserWindow } from "electron";

export const destroyWindows = (): void => {
  const windows = BrowserWindow.getAllWindows();

  for (const window of windows) {
    if (!window.isDestroyed()) {
      window.destroy();
    }
  }
};
