import "./localStorageMock";
import "@testing-library/jest-dom";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { createI18nOptions } from "@/i18n";
import { systemClock } from "@/lib/temporal";
import { localeRegistry } from "@/locales";
import { UNIT_TEST_DEVICE_TIME_ZONE } from "./deviceTimeZone";
import { FakePointerEvent } from "./fakePointerEvent";

// jsdom doesn't implement ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof globalThis.ResizeObserver;

// jsdom doesn't implement PointerEvent; a legacy test removes it with vi.stubGlobal
if (typeof globalThis.PointerEvent !== "function") {
  globalThis.PointerEvent = FakePointerEvent as unknown as typeof PointerEvent;
}

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
  ...createI18nOptions(localeRegistry),
  lng: "ru",
  fallbackLng: "ru",
});

// jsdom reports en-US. Pin the browser languages to the language a test set on i18next,
// so a rendered AppShell with no chosen language switches nothing (FR7, D8).
for (const [property, read] of [
  ["languages", () => [i18n.language]],
  ["language", () => i18n.language],
] as const) {
  Object.defineProperty(navigator, property, { configurable: true, get: read });
}

// Plain assignment: vi.restoreAllMocks() would undo a spy.
systemClock.timeZoneId = () => UNIT_TEST_DEVICE_TIME_ZONE;
