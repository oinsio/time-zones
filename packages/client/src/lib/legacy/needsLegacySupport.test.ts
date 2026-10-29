// FR2 of support-legacy-ios-12-safari: polyfills are needed only when a built-in is missing.
import { afterEach, describe, expect, it, vi } from "vitest";
import { LEGACY_ZONE_PROBE_ID } from "@/constants";
import { needsLegacySupport } from "./needsLegacySupport";

const nativeDateTimeFormat = Intl.DateTimeFormat;
const arrayAt = Array.prototype.at;

function rejectProbeZone() {
  function RejectingFormat(
    locales?: string | string[],
    options?: Intl.DateTimeFormatOptions,
  ) {
    if (options?.timeZone === LEGACY_ZONE_PROBE_ID) {
      throw new RangeError("Invalid time zone");
    }
    return new nativeDateTimeFormat(locales, options);
  }
  Intl.DateTimeFormat =
    RejectingFormat as unknown as typeof Intl.DateTimeFormat;
}

describe("needsLegacySupport", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    Intl.DateTimeFormat = nativeDateTimeFormat;
    Array.prototype.at = arrayAt;
  });

  it("should be false on an engine with every built-in", () => {
    expect(needsLegacySupport()).toBe(false);
  });

  it.each([
    [
      "Array#at is missing",
      () => {
        // @ts-expect-error simulating an engine without Array#at
        delete Array.prototype.at;
      },
    ],
    [
      "ResizeObserver is missing",
      () => vi.stubGlobal("ResizeObserver", undefined),
    ],
    ["the engine rejects the probe zone", rejectProbeZone],
  ])("should be true when %s", (_description, removeBuiltIn) => {
    removeBuiltIn();

    expect(needsLegacySupport()).toBe(true);
  });
});
