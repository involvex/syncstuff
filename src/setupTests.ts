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
vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"), // Use actual for things like `useLocation`
  BrowserRouter: vi.fn(({ children }) =>
    React.createElement("div", null, children),
  ),
  Route: vi.fn(({ children }) => React.createElement("div", null, children)),
  Redirect: vi.fn(() => null),
  useHistory: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
  useLocation: vi.fn(() => ({
    pathname: "/",
    search: "",
    hash: "",
    state: undefined,
  })),
  useParams: vi.fn(() => ({})),
  useRouteMatch: vi.fn(() => ({
    url: "/",
    path: "/",
    isExact: true,
    params: {},
  })),
}));

// Mock react-router (v5)
vi.mock("react-router", () => ({
  ...vi.importActual("react-router"),
  Router: vi.fn(({ children }) => React.createElement("div", null, children)),
  Route: vi.fn(({ children }) => React.createElement("div", null, children)),
  useHistory: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
  useLocation: vi.fn(() => ({
    pathname: "/",
    search: "",
    hash: "",
    state: undefined,
  })),
  useParams: vi.fn(() => ({})),
  useRouteMatch: vi.fn(() => ({
    url: "/",
    path: "/",
    isExact: true,
    params: {},
  })),
}));

// Mock @ionic/react-router
vi.mock("@ionic/react-router", () => ({
  ...vi.importActual("@ionic/react-router"),
  IonReactRouter: vi.fn(({ children }) =>
    React.createElement("div", null, children),
  ),
  IonRouterOutlet: vi.fn(({ children }) =>
    React.createElement("div", null, children),
  ),
  IonRoute: vi.fn(({ children }) => React.createElement("div", null, children)),
}));

// Mock BarcodeScanner for non-native test environment
vi.mock("@capacitor-mlkit/barcode-scanning", () => ({
  BarcodeScanner: {
    checkPermissions: vi.fn(() => Promise.resolve({ camera: "granted" })),
    requestPermissions: vi.fn(() => Promise.resolve({ camera: "granted" })),
    scan: vi.fn(() =>
      Promise.resolve({ barcodes: [{ rawValue: "MOCKED_DEVICE_ID" }] }),
    ),
    hideBackground: vi.fn(() => Promise.resolve()),
    showBackground: vi.fn(() => Promise.resolve()),
    stopScan: vi.fn(() => Promise.resolve()), // Added stopScan mock
  },
}));

// Mock @ionic/storage for non-browser test environment
vi.mock("@ionic/storage", () => {
  const mockStorage: { [key: string]: unknown } = {};
  return {
    Storage: vi.fn().mockImplementation(() => ({
      create: vi.fn(() => Promise.resolve()),
      get: vi.fn(async (key: string) => mockStorage[key]),
      set: vi.fn((key: string, value: unknown) => {
        mockStorage[key] = value;
        return true;
      }),
      remove: vi.fn(async (key: string) => {
        delete mockStorage[key];
        return true;
      }),
      clear: vi.fn(async () => {
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
        return true;
      }),
      forEach: vi.fn(),
      length: vi.fn(() => Object.keys(mockStorage).length),
      keys: vi.fn(() => Object.keys(mockStorage)),
      setMany: vi.fn(),
      getMany: vi.fn(),
      removeMany: vi.fn(),
    })),
  };
});
