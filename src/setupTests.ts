// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import { vi } from "vitest";
import React from "react";

// Mock window.matchMedia for Vitest/JSDOM environment
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock react-router-dom (v5)
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
    Route: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
    Redirect: () => null,
    useHistory: () => ({ push: vi.fn(), replace: vi.fn(), listen: vi.fn() }),
    useLocation: () => ({
      pathname: "/",
      search: "",
      hash: "",
      state: undefined,
    }),
    useParams: () => ({}),
    useRouteMatch: () => ({
      url: "/",
      path: "/",
      isExact: true,
      params: {},
    }),
    withRouter: (component: any) => component,
  };
});

// Mock react-router (v5)
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    Router: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
    Route: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
    useHistory: () => ({ push: vi.fn(), replace: vi.fn(), listen: vi.fn() }),
    useLocation: () => ({
      pathname: "/",
      search: "",
      hash: "",
      state: undefined,
    }),
    useParams: () => ({}),
    useRouteMatch: () => ({
      url: "/",
      path: "/",
      isExact: true,
      params: {},
    }),
    withRouter: (component: any) => component,
  };
});

// Mock @ionic/react-router
vi.mock("@ionic/react-router", async () => {
  const actual = await vi.importActual("@ionic/react-router");
  return {
    ...actual,
    IonReactRouter: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
    IonRouterOutlet: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
    IonRoute: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
  };
});

// Mock BarcodeScanner
vi.mock("@capacitor-mlkit/barcode-scanning", () => ({
  BarcodeScanner: {
    checkPermissions: vi.fn(() => Promise.resolve({ camera: "granted" })),
    requestPermissions: vi.fn(() => Promise.resolve({ camera: "granted" })),
    scan: vi.fn(() =>
      Promise.resolve({ barcodes: [{ rawValue: "MOCKED_DEVICE_ID" }] }),
    ),
    hideBackground: vi.fn(() => Promise.resolve()),
    showBackground: vi.fn(() => Promise.resolve()),
    stopScan: vi.fn(() => Promise.resolve()),
  },
}));

// Mock @capacitor/device
vi.mock("@capacitor/device", () => ({
  Device: {
    getInfo: vi.fn(() =>
      Promise.resolve({ manufacturer: "Test", model: "Device" }),
    ),
    getId: vi.fn(() => Promise.resolve({ identifier: "test-device-id" })),
  },
}));

// Mock @capacitor/clipboard
vi.mock("@capacitor/clipboard", () => ({
  Clipboard: {
    write: vi.fn(() => Promise.resolve()),
    read: vi.fn(() => Promise.resolve({ value: "test clipboard" })),
  },
}));

// Mock @capacitor/filesystem
vi.mock("@capacitor/filesystem", () => ({
  Filesystem: {
    readFile: vi.fn(() => Promise.resolve({ data: "test data" })),
    writeFile: vi.fn(() => Promise.resolve()),
    appendFile: vi.fn(() => Promise.resolve()),
    deleteFile: vi.fn(() => Promise.resolve()),
    stat: vi.fn(() => Promise.resolve({ size: 100 })),
    Directory: {
      Documents: "DOCUMENTS",
      Cache: "CACHE",
    },
    Encoding: {
      UTF8: "utf8",
    },
  },
}));

// Mock @capacitor/core
vi.mock("@capacitor/core", async () => {
  const actual = await vi.importActual("@capacitor/core");
  return {
    ...actual,
    Capacitor: {
      isNativePlatform: () => false,
      getPlatform: () => "web",
    },
  };
});

// Mock @ionic/storage
vi.mock("@ionic/storage", () => {
  const mockStorageStore: { [key: string]: unknown } = {};
  const mockStorageInstance = {
    create: vi.fn(async () => mockStorageInstance), // Return self
    get: vi.fn(async (key: string) => mockStorageStore[key]),
    set: vi.fn(async (key: string, value: unknown) => {
      mockStorageStore[key] = value;
      return true;
    }),
    remove: vi.fn(async (key: string) => {
      delete mockStorageStore[key];
      return true;
    }),
    clear: vi.fn(async () => {
      Object.keys(mockStorageStore).forEach(key => delete mockStorageStore[key]);
      return true;
    }),
    forEach: vi.fn(),
    length: vi.fn(async () => Object.keys(mockStorageStore).length),
    keys: vi.fn(async () => Object.keys(mockStorageStore)),
    setMany: vi.fn(),
    getMany: vi.fn(),
    removeMany: vi.fn(),
  };

  return {
    Storage: vi.fn(() => mockStorageInstance),
  };
});

// Mock capacitor-zeroconf
vi.mock("capacitor-zeroconf", () => ({
  ZeroConf: {
    watch: vi.fn(() => Promise.resolve()),
    unwatch: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
    register: vi.fn(() => Promise.resolve()),
    stop: vi.fn(() => Promise.resolve()),
    addListener: vi.fn(),
  },
}));