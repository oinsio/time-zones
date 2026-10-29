// FR4 of support-legacy-ios-12-safari: the shim reaches temporal-polyfill
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const RENAMED_ZONE_ID = "Europe/Kyiv";
const LEGACY_ZONE_ID = "Europe/Kiev";

type ZoneCall = { timeZone: string; isAccepted: boolean };

// temporal-polyfill upper-cases the zone before it reaches Intl.DateTimeFormat.
function isRenamedZone(timeZone: string | undefined): boolean {
  return timeZone?.toLowerCase() === RENAMED_ZONE_ID.toLowerCase();
}

describe("legacy zone shim against temporal-polyfill", () => {
  const nativeDateTimeFormat = Intl.DateTimeFormat;
  let zoneCalls: ZoneCall[];

  beforeEach(() => {
    zoneCalls = [];
    const FakeNative = function (
      locales?: string | string[],
      options?: Intl.DateTimeFormatOptions,
    ) {
      const timeZone = options?.timeZone;
      if (timeZone !== undefined) {
        const isAccepted = !isRenamedZone(timeZone);
        zoneCalls.push({ timeZone, isAccepted });
        if (!isAccepted) throw new RangeError(`Invalid time zone ${timeZone}`);
      }
      return new nativeDateTimeFormat(locales, options);
    } as unknown as typeof Intl.DateTimeFormat;
    Object.defineProperty(FakeNative, "prototype", {
      value: nativeDateTimeFormat.prototype,
    });
    FakeNative.supportedLocalesOf = nativeDateTimeFormat.supportedLocalesOf;
    const WithRetry = function (
      locales?: string | string[],
      options?: Intl.DateTimeFormatOptions,
    ) {
      try {
        return new FakeNative(locales, options);
      } catch (error) {
        if (!isRenamedZone(options?.timeZone)) throw error;
        return new FakeNative(locales, {
          ...options,
          timeZone: LEGACY_ZONE_ID,
        });
      }
    } as unknown as typeof Intl.DateTimeFormat;
    Object.defineProperty(WithRetry, "prototype", {
      value: nativeDateTimeFormat.prototype,
    });
    WithRetry.supportedLocalesOf = nativeDateTimeFormat.supportedLocalesOf;
    Intl.DateTimeFormat = WithRetry;
    vi.resetModules();
  });

  afterEach(() => {
    Intl.DateTimeFormat = nativeDateTimeFormat;
    vi.resetModules();
  });

  it("calls the native constructor with the renamed zone, then the legacy one", async () => {
    const { Temporal } = await import("@/lib/temporal");
    Temporal.Instant.from("2026-03-08T07:30:00Z").toZonedDateTimeISO(
      RENAMED_ZONE_ID,
    );
    const rejectedIndex = zoneCalls.findIndex(
      (call) => isRenamedZone(call.timeZone) && !call.isAccepted,
    );
    expect(rejectedIndex).toBeGreaterThanOrEqual(0);
    expect(
      zoneCalls
        .slice(rejectedIndex + 1)
        .some((call) => call.timeZone === LEGACY_ZONE_ID && call.isAccepted),
    ).toBe(true);
  });

  it("formats local time and offset of the renamed zone", async () => {
    const { Temporal } = await import("@/lib/temporal");
    const zoned = Temporal.Instant.from(
      "2026-03-08T07:30:00Z",
    ).toZonedDateTimeISO(RENAMED_ZONE_ID);
    expect(zoned.toPlainTime().toString()).toBe("09:30:00");
    expect(zoned.offset).toBe("+02:00");
    // Recorded: the polyfill keeps the name it was given, not the retried one.
    expect(zoned.timeZoneId).toBe(RENAMED_ZONE_ID);
  });

  it.each([
    ["UNIQUE", "2026-03-08T10:00", "2026-03-08T08:00:00Z"],
    ["GAP", "2026-03-29T03:30", "2026-03-29T01:30:00Z"],
    ["AMBIGUOUS", "2026-10-25T03:30", "2026-10-25T00:30:00Z"],
  ])("resolves a %s wall-clock time", async (status, wallClock, instant) => {
    const { Temporal } = await import("@/lib/temporal");
    const { resolveWallClock } = await import("@/model");
    const resolved = resolveWallClock(
      RENAMED_ZONE_ID,
      Temporal.PlainDateTime.from(wallClock),
    );
    expect(resolved.status).toBe(status);
    expect(resolved.instant.toString()).toBe(
      Temporal.Instant.from(instant).toString(),
    );
  });
});
