// @add-zone-rules-from-iana @FR6: zone names, resolved options and fall-through of the wrapper
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { createStaleDateTimeFormat } from "@/test/fakeStaleDateTimeFormat";
import {
  ALMATY_INSTANT,
  CLOCK_TIME_OPTIONS,
  createWrapper,
  NOON_INSTANT,
} from "@/test/zoneRules/wrapperWorld";
import { parseZoneRulesRelease, ZoneRulesReleaseError } from "./core/index.ts";
import { createZoneRulesDateTimeFormat } from "./dateTimeFormatWrapper.ts";

describe("zone names", () => {
  it.each([
    ["America/New_York", "EDT"],
    ["Asia/Almaty", "GMT+5"],
    ["Asia/Kolkata", "IST"],
    ["Asia/Kathmandu", "GMT+5:45"],
    ["UTC", "UTC"],
  ])("names %s %s", (zoneId, expectedName) => {
    const { Wrapper } = createWrapper();
    const parts = new Wrapper("en", {
      timeZone: zoneId,
      hour: "numeric",
      timeZoneName: "short",
    }).formatToParts(NOON_INSTANT);
    expect(parts.find((part) => part.type === "timeZoneName")?.value).toBe(
      expectedName,
    );
  });

  it("names a zone at UTC GMT", () => {
    const { Wrapper } = createWrapper();
    const parts = new Wrapper("en", {
      timeZone: "Europe/Dublin",
      hour: "numeric",
      timeZoneName: "short",
    }).formatToParts(
      Temporal.Instant.from("2026-01-15T12:00:00Z").epochMilliseconds,
    );
    expect(parts.find((part) => part.type === "timeZoneName")?.value).toBe(
      "GMT",
    );
  });

  it("writes the zone name where the locale puts it", () => {
    const { Wrapper } = createWrapper();
    const text = new Wrapper("en", {
      timeZone: "Asia/Kathmandu",
      hour: "numeric",
      minute: "2-digit",
      hourCycle: "h23",
      timeZoneName: "short",
    }).format(NOON_INSTANT);
    expect(text).toBe("17:45 GMT+5:45");
  });

  it("names a zone west of UTC with its minutes", () => {
    const NEGATIVE_HALF_HOUR_RELEASE = parseZoneRulesRelease({
      release: "test",
      cutoff: 946684800,
      zones: {
        "Test/Newfoundland": {
          types: [[-12600, "-0330", 0]],
          cutoffType: 0,
          changes: [],
          futureRule: "<-0330>3:30",
        },
      },
    });
    if (NEGATIVE_HALF_HOUR_RELEASE instanceof ZoneRulesReleaseError)
      throw NEGATIVE_HALF_HOUR_RELEASE;
    const { staleDateTimeFormat } = createStaleDateTimeFormat();
    const Other = createZoneRulesDateTimeFormat(
      staleDateTimeFormat,
      NEGATIVE_HALF_HOUR_RELEASE,
    );
    const parts = new Other("en", {
      timeZone: "Test/Newfoundland",
      hour: "numeric",
      timeZoneName: "short",
    }).formatToParts(NOON_INSTANT);
    expect(parts.find((part) => part.type === "timeZoneName")?.value).toBe(
      "GMT-3:30",
    );
  });
});

describe("resolved options keep the requested id", () => {
  it.each([
    ["Europe/Kyiv", "Europe/Kyiv"],
    ["europe/kyiv", "Europe/Kyiv"],
    ["Europe/Oslo", "Europe/Oslo"],
    ["Asia/Calcutta", "Asia/Calcutta"],
  ])("resolves %s to %s", (requested, resolved) => {
    const { Wrapper } = createWrapper();
    expect(
      new Wrapper("en", { timeZone: requested }).resolvedOptions().timeZone,
    ).toBe(resolved);
  });

  it("keeps the locale and the other options of the native formatter", () => {
    const { Wrapper } = createWrapper();
    const resolved = new Wrapper("ru", {
      timeZone: "Asia/Almaty",
      hour: "numeric",
    }).resolvedOptions();
    expect(resolved.locale).toBe("ru");
  });
});

describe("zones the release does not know fall through", () => {
  it("passes the zone to the native constructor unchanged", () => {
    const { Wrapper, calls } = createWrapper();
    const formatter = new Wrapper("en", {
      timeZone: "Asia/Tokyo",
      ...CLOCK_TIME_OPTIONS,
    });
    expect(calls).toEqual([{ timeZone: "Asia/Tokyo", isRejected: false }]);
    expect(formatter.format(ALMATY_INSTANT)).toBe("17:00");
  });

  it("lets the native constructor reject a zone nobody knows", () => {
    const { Wrapper } = createWrapper();
    expect(() => new Wrapper("en", { timeZone: "Mars/Olympus_Mons" })).toThrow(
      RangeError,
    );
  });

  it("passes a formatter without a zone to the native constructor", () => {
    const { Wrapper, calls } = createWrapper();
    new Wrapper("en");
    expect(calls).toEqual([{ timeZone: undefined, isRejected: false }]);
  });

  it("can be called without new", () => {
    const { Wrapper } = createWrapper();
    const formatter = (
      Wrapper as unknown as (
        locales: string,
        options: object,
      ) => Intl.DateTimeFormat
    )("en", { timeZone: "Asia/Almaty", ...CLOCK_TIME_OPTIONS });
    expect(formatter.format(ALMATY_INSTANT)).toBe("13:00");
  });
});
