import "./localStorageMock";
import "@testing-library/jest-dom";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { languageResolutionOptions, localeResources } from "@/i18n";
import { systemClock } from "@/lib/temporal";
import { UNIT_TEST_DEVICE_TIME_ZONE } from "./deviceTimeZone";

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

// Plain assignment: vi.restoreAllMocks() would undo a spy.
systemClock.timeZoneId = () => UNIT_TEST_DEVICE_TIME_ZONE;
