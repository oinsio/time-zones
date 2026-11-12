// @add-zone-rules-from-iana @FR6 @NFR-P3: formatRange and the current instant of the wrapper
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { realNativeDateTimeFormat } from "@/test/installZoneRules";
import {
  ALMATY_INSTANT,
  CLOCK_TIME_OPTIONS,
  createWrapper,
  fixtureRelease,
} from "@/test/zoneRules/wrapperWorld";
import { createZoneRulesDateTimeFormat } from "./dateTimeFormatWrapper.ts";

describe("formatRange", () => {
  it("shifts both ends by the offsets of the rules", () => {
    const { Wrapper } = createWrapper();
    const formatter = new Wrapper("en", {
      timeZone: "Asia/Almaty",
      ...CLOCK_TIME_OPTIONS,
    });
    const text = formatter.formatRange(
      ALMATY_INSTANT,
      ALMATY_INSTANT + 2 * 3_600_000,
    );
    expect(text).toContain("13:00");
    expect(text).toContain("15:00");
  });

  it("names the zone once, by the offset at the end of the range", () => {
    const { Wrapper } = createWrapper();
    const formatter = new Wrapper("en", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
      hourCycle: "h23",
      timeZoneName: "short",
    });
    const parts = formatter.formatRangeToParts(
      Temporal.Instant.from("2026-03-08T06:00:00Z").epochMilliseconds,
      Temporal.Instant.from("2026-03-08T09:00:00Z").epochMilliseconds,
    );
    const zoneNames = parts
      .filter((part) => part.type === "timeZoneName")
      .map((part) => part.value);
    expect(zoneNames).toEqual(["EDT"]);
  });

  it("is absent when the native prototype has none", () => {
    const prototype = Object.create(realNativeDateTimeFormat.prototype, {
      formatRange: { value: undefined },
      formatRangeToParts: { value: undefined },
    });
    function NativeWithoutRange(
      locales?: string | string[],
      options?: Intl.DateTimeFormatOptions,
    ) {
      return new realNativeDateTimeFormat(locales, options);
    }
    Object.defineProperty(NativeWithoutRange, "prototype", {
      value: prototype,
    });
    const Wrapper = createZoneRulesDateTimeFormat(
      NativeWithoutRange as unknown as typeof Intl.DateTimeFormat,
      fixtureRelease,
    );
    const formatter = new Wrapper("en", { timeZone: "Asia/Almaty" });
    expect(formatter.formatRange).toBeUndefined();
    expect(formatter.formatRangeToParts).toBeUndefined();
  });
});

describe("a formatter without a date formats the current instant", () => {
  const FIXED_INSTANT = Temporal.Instant.from(
    "2026-07-15T08:00:00Z",
  ).epochMilliseconds;

  function createClockNative() {
    const log = { constructions: 0, formatToPartsCalls: 0 };
    function ClockNative(
      locales?: string | string[],
      options?: Intl.DateTimeFormatOptions,
    ) {
      log.constructions += 1;
      const real = new realNativeDateTimeFormat(locales, options);
      return new Proxy(real, {
        get(target, property) {
          const value = Reflect.get(target, property, target);
          if (property === "formatToParts") {
            return (date?: number) => {
              log.formatToPartsCalls += 1;
              return target.formatToParts(date ?? FIXED_INSTANT);
            };
          }
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
    }
    Object.defineProperty(ClockNative, "prototype", {
      value: realNativeDateTimeFormat.prototype,
    });
    return {
      Native: ClockNative as unknown as typeof Intl.DateTimeFormat,
      log,
    };
  }

  it("reads the instant the native UTC formatter reports", () => {
    const { Native } = createClockNative();
    const Wrapper = createZoneRulesDateTimeFormat(Native, fixtureRelease);
    expect(
      new Wrapper("en", {
        timeZone: "Asia/Almaty",
        ...CLOCK_TIME_OPTIONS,
      }).format(),
    ).toBe("13:00");
  });

  it("builds exactly one native formatter per instance", () => {
    const { Native, log } = createClockNative();
    const Wrapper = createZoneRulesDateTimeFormat(Native, fixtureRelease);
    new Wrapper("en", { timeZone: "Asia/Almaty", ...CLOCK_TIME_OPTIONS });
    expect(log.constructions).toBe(1);
  });

  it("makes one native call for a call with a date", () => {
    const { Native, log } = createClockNative();
    const formatter = new (createZoneRulesDateTimeFormat(
      Native,
      fixtureRelease,
    ))("en", { timeZone: "Asia/Almaty", ...CLOCK_TIME_OPTIONS });
    formatter.formatToParts(ALMATY_INSTANT);
    expect(log.formatToPartsCalls).toBe(1);
  });

  it("makes two native calls for a call without a date and builds the clock formatter once", () => {
    const { Native, log } = createClockNative();
    const Wrapper = createZoneRulesDateTimeFormat(Native, fixtureRelease);
    const formatter = new Wrapper("en", {
      timeZone: "Asia/Almaty",
      ...CLOCK_TIME_OPTIONS,
    });
    formatter.formatToParts();
    expect(log.formatToPartsCalls).toBe(2);
    formatter.formatToParts();
    expect(log.constructions).toBe(2);
  });
});
