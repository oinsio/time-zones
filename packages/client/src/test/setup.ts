import "@testing-library/jest-dom";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { languageResolutionOptions, localeResources } from "@/i18n";

// Node.js 22+ has a built-in global `localStorage` that lacks Web Storage API methods.
// Override it with a fully functional in-memory implementation for all tests.
const createLocalStorageMock = (): Storage => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    get length() {
      return store.size;
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
  };
};

Object.defineProperty(globalThis, "localStorage", {
  value: createLocalStorageMock(),
  writable: true,
  configurable: true,
});

// jsdom doesn't implement ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof globalThis.ResizeObserver;

// jsdom doesn't implement window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

void i18n.use(initReactI18next).init({
  resources: localeResources,
  ...languageResolutionOptions,
  lng: "ru",
  fallbackLng: "ru",
  interpolation: { escapeValue: false },
});
