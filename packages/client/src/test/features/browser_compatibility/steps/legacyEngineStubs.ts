import { vi } from "vitest";

const REDUCED_MOTION_OFF = false;

const replaceProperty = (target: object, name: string, value: unknown) => {
  const original = Object.getOwnPropertyDescriptor(target, name);
  Object.defineProperty(target, name, {
    value,
    configurable: true,
    writable: true,
  });
  return () => {
    if (original === undefined) Reflect.deleteProperty(target, name);
    else Object.defineProperty(target, name, original);
  };
};

/** A `MediaQueryList` of iOS Safari 12: listeners only through `addListener`. */
export const buildLegacyMediaQueryList = (matches = REDUCED_MOTION_OFF) => {
  const listeners = new Set<() => void>();
  return {
    matches,
    addListener: (listener: () => void) => listeners.add(listener),
    removeListener: (listener: () => void) => listeners.delete(listener),
    setMatches(nextMatches: boolean) {
      this.matches = nextMatches;
      for (const listener of listeners) listener();
    },
    listenerCount: () => listeners.size,
  };
};

/**
 * Makes the jsdom environment lack what iOS Safari 12 lacks: `Intl.DisplayNames`,
 * `ResizeObserver`, `PointerEvent` and `MediaQueryList#addEventListener`.
 * Returns the restore function. Implements FR1 of support-legacy-ios-12-safari.
 */
export function stubLegacyEngine(
  mediaQueryList = buildLegacyMediaQueryList(),
): () => void {
  const restoreDisplayNames = replaceProperty(Intl, "DisplayNames", undefined);
  vi.stubGlobal("ResizeObserver", undefined);
  vi.stubGlobal("PointerEvent", undefined);
  vi.stubGlobal("matchMedia", () => mediaQueryList);
  return restoreDisplayNames;
}
