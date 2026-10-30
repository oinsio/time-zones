// Verifies FR13 of add-wall-time-input-with-hint (D1, M8): a renamed zone on outdated zone data.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLegacyZoneDateTimeFormat } from "@/lib/legacy";

const RENAMED_ZONE_ID = "Europe/Kyiv";
const LEGACY_ZONE_ID = "Europe/Kiev";

describe("SET_WALL_TIME on an engine that knows Europe/Kyiv only as Europe/Kiev", () => {
  const nativeDateTimeFormat = Intl.DateTimeFormat;

  beforeEach(() => {
    function FakeNative(
      locales?: string | string[],
      options?: Intl.DateTimeFormatOptions,
    ) {
      if (options?.timeZone?.toLowerCase() === RENAMED_ZONE_ID.toLowerCase()) {
        throw new RangeError(`Invalid time zone ${options.timeZone}`);
      }
      return new nativeDateTimeFormat(locales, options);
    }
    Object.defineProperty(FakeNative, "prototype", {
      value: nativeDateTimeFormat.prototype,
    });
    const nativeStandIn = Object.assign(FakeNative, {
      supportedLocalesOf: nativeDateTimeFormat.supportedLocalesOf,
    }) as unknown as typeof Intl.DateTimeFormat;
    Intl.DateTimeFormat = createLegacyZoneDateTimeFormat(nativeStandIn, {
      [RENAMED_ZONE_ID]: [LEGACY_ZONE_ID],
    });
    vi.resetModules();
  });

  afterEach(() => {
    Intl.DateTimeFormat = nativeDateTimeFormat;
    vi.resetModules();
  });

  it("pins the same instant as a modern engine and keeps the canonical zone", async () => {
    const model = await import("@/model");
    const kyiv = {
      id: "Europe/Kyiv|Kyiv",
      timeZoneId: RENAMED_ZONE_ID,
      label: "Kyiv",
      countryCode: "UA",
    };
    const result = model.reduceLocations(
      {
        ...model.INITIAL_WORLD_CLOCK_STATE,
        deviceTimeZoneId: "Asia/Almaty",
        locations: [kyiv],
      },
      {
        type: model.LocationCommandType.SET_WALL_TIME,
        target: {
          kind: model.WallTimeTargetKind.LOCATION,
          locationId: kyiv.id,
        },
        time: "10:00",
        date: "2026-03-08",
      },
    );
    if (!result.ok) throw new Error("expected ok");
    const { reference, locations } = result.state;
    if (reference.mode !== model.ReferenceMode.PINNED)
      throw new Error("pinned");
    expect(reference.instant.toString()).toBe("2026-03-08T08:00:00Z");
    expect(reference.wallClockStatus).toBe(model.WallClockStatus.UNIQUE);
    expect(locations[0]?.timeZoneId).toBe(RENAMED_ZONE_ID);
  });
});
