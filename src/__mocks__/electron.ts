import { vi } from "vitest";

export const mockApp = {
  getPath: vi.fn((name: string) => `/mock/path/${name}`),
  getVersion: vi.fn(() => "1.0.0"),
  getName: vi.fn(() => "MockApp"),
  quit: vi.fn(),
  exit: vi.fn(),
  on: vi.fn(),
  once: vi.fn(),
  removeListener: vi.fn(),
  whenReady: vi.fn(() => Promise.resolve()),
  isReady: vi.fn(() => true),
  getAppPath: vi.fn(() => "/mock/app"),
};

export const mockBrowserWindow = vi.fn().mockImplementation(() => ({
  loadURL: vi.fn(() => Promise.resolve()),
  loadFile: vi.fn(() => Promise.resolve()),
  on: vi.fn(),
  once: vi.fn(),
  webContents: {
    send: vi.fn(),
    on: vi.fn(),
    executeJavaScript: vi.fn(() => Promise.resolve()),
    openDevTools: vi.fn(),
    closeDevTools: vi.fn(),
  },
  show: vi.fn(),
  hide: vi.fn(),
  close: vi.fn(),
  destroy: vi.fn(),
  isDestroyed: vi.fn(() => false),
  isFocused: vi.fn(() => true),
  focus: vi.fn(),
  id: 1,
}));

// Add static methods to mockBrowserWindow
Object.assign(mockBrowserWindow, {
  getAllWindows: vi.fn(() => []),
});

export const mockIpcMain = {
  on: vi.fn(),
  once: vi.fn(),
  handle: vi.fn(),
  removeHandler: vi.fn(),
  removeListener: vi.fn(),
  removeAllListeners: vi.fn(),
};

export const mockDialog = {
  showOpenDialog: vi.fn(() =>
    Promise.resolve({
      canceled: false,
      filePaths: ["/mock/file.txt"],
    }),
  ),
  showSaveDialog: vi.fn(() =>
    Promise.resolve({
      canceled: false,
      filePath: "/mock/save.txt",
    }),
  ),
  showMessageBox: vi.fn(() =>
    Promise.resolve({
      response: 0,
    }),
  ),
  showErrorBox: vi.fn(),
};

export const mockSession = {
  defaultSession: {
    webRequest: {
      onHeadersReceived: vi.fn(),
    },
  },
};

export const mockElectron = {
  app: mockApp,
  BrowserWindow: mockBrowserWindow,
  ipcMain: mockIpcMain,
  dialog: mockDialog,
  session: mockSession,
};

vi.mock("electron", () => mockElectron);
