// FR2, FR4, FR6 of support-legacy-ios-12-safari: legacy support installs what is missing.
import { afterEach, describe, expect, it, vi } from "vitest";
import { LEGACY_ZONE_PROBE_ID } from "@/constants";

const nativeDateTimeFormat = Intl.DateTimeFormat;

describe("installLegacySupport", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
    Intl.DateTimeFormat = nativeDateTimeFormat;
  });

  it("should install ResizeObserver when it is absent", async () => {
    vi.stubGlobal("ResizeObserver", undefined);
    vi.resetModules();
    const { loadLegacySupport } = await import("./index");

    await loadLegacySupport();

    expect(globalThis.ResizeObserver).toBeTypeOf("function");
  });

  it("should keep an existing ResizeObserver", async () => {
    const existingObserver = globalThis.ResizeObserver;
    vi.resetModules();
    const { loadLegacySupport } = await import("./index");

    await loadLegacySupport();

    expect(globalThis.ResizeObserver).toBe(existingObserver);
  });

  it("should install the zone shim only when the zone data is outdated", async () => {
    function OutdatedFormat(
      locales?: string | string[],
      options?: Intl.DateTimeFormatOptions,
    ) {
      if (options?.timeZone === LEGACY_ZONE_PROBE_ID) {
        throw new RangeError("Invalid time zone");
      }
      return new nativeDateTimeFormat(locales, options);
    }
    Object.defineProperty(OutdatedFormat, "prototype", {
      value: nativeDateTimeFormat.prototype,
    });
    const outdatedConstructor =
      OutdatedFormat as unknown as typeof Intl.DateTimeFormat;
    Intl.DateTimeFormat = outdatedConstructor;
    vi.resetModules();
    const { loadLegacySupport } = await import("./index");

    await loadLegacySupport();

    expect(Intl.DateTimeFormat).not.toBe(outdatedConstructor);
  });

  it("should leave Intl.DateTimeFormat alone when the zone data is current", async () => {
    vi.resetModules();
    const { loadLegacySupport } = await import("./index");

    await loadLegacySupport();

    expect(Intl.DateTimeFormat).toBe(nativeDateTimeFormat);
  });
});
