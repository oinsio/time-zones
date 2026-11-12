// @add-zone-rules-from-iana @FR6 @NFR-P3: the Intl.DateTimeFormat wrapper over the stale engine
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { realNativeDateTimeFormat } from "@/test/installZoneRules";
import {
  ALMATY_INSTANT,
  CLOCK_TIME_OPTIONS,
  countCallsFor,
  createWrapper,
} from "@/test/zoneRules/wrapperWorld";

describe("parts come from the rules", () => {
  it("splits the instant into the Almaty fields of UTC+5 although the engine says UTC+6", () => {
    const { Wrapper } = createWrapper();
    const parts = new Wrapper("en", {
      timeZone: "Asia/Almaty",
      hour: "numeric",
      minute: "2-digit",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hourCycle: "h23",
    }).formatToParts(ALMATY_INSTANT);
    const readPartValue = (type: string) =>
      parts.find((part) => part.type === type)?.value;
    expect([
      readPartValue("hour"),
      readPartValue("minute"),
      readPartValue("day"),
      readPartValue("month"),
      readPartValue("year"),
    ]).toEqual(["13", "00", "15", "7", "2026"]);
  });

  it("never asks the engine for Almaty, whose data is stale", () => {
    const { Wrapper, calls } = createWrapper();
    new Wrapper("en", {
      timeZone: "Asia/Almaty",
      ...CLOCK_TIME_OPTIONS,
    }).format(ALMATY_INSTANT);
    expect(countCallsFor(calls, "Asia/Almaty")).toBe(0);
  });

  it("accepts a zone the engine rejects", () => {
    const { Wrapper } = createWrapper();
    const formatter = new Wrapper("en", {
      timeZone: "Europe/Kyiv",
      ...CLOCK_TIME_OPTIONS,
    });
    expect(
      formatter.format(
        Temporal.Instant.from("2026-03-08T07:30:00Z").epochMilliseconds,
      ),
    ).toBe("09:30");
  });

  it("reads the instant of a Date", () => {
    const { Wrapper } = createWrapper();
    const dateLike = { valueOf: () => ALMATY_INSTANT } as unknown as Date;
    expect(
      new Wrapper("en", {
        timeZone: "Asia/Almaty",
        ...CLOCK_TIME_OPTIONS,
      }).format(dateLike),
    ).toBe("13:00");
  });

  it("matches the zone ignoring case", () => {
    const { Wrapper } = createWrapper();
    expect(
      new Wrapper("en", {
        timeZone: "ASIA/ALMATY",
        ...CLOCK_TIME_OPTIONS,
      }).format(ALMATY_INSTANT),
    ).toBe("13:00");
  });

  it("follows a clock change of the rules", () => {
    const { Wrapper } = createWrapper();
    const formatter = new Wrapper("en", {
      timeZone: "America/New_York",
      ...CLOCK_TIME_OPTIONS,
    });
    const beforeChange = Temporal.Instant.from(
      "2026-03-08T06:59:59Z",
    ).epochMilliseconds;
    const atChange = Temporal.Instant.from(
      "2026-03-08T07:00:00Z",
    ).epochMilliseconds;
    expect([
      formatter.format(beforeChange),
      formatter.format(atChange),
    ]).toEqual(["01:59", "03:00"]);
  });
});

describe("formatting in Russian keeps the locale", () => {
  it("reads 15 июля 2026 г. в 13:00 for the long date and the short time", () => {
    const { Wrapper } = createWrapper();
    const formatter = new Wrapper("ru", {
      timeZone: "Asia/Almaty",
      dateStyle: "long",
      timeStyle: "short",
    });
    expect(formatter.format(ALMATY_INSTANT)).toBe("15 июля 2026 г. в 13:00");
  });
});

describe("the constructor looks like Intl.DateTimeFormat", () => {
  it("keeps prototype, supportedLocalesOf and instanceof", () => {
    const { Wrapper } = createWrapper();
    const formatter = new Wrapper("en", { timeZone: "Asia/Almaty" });
    expect(Wrapper.prototype).toBe(realNativeDateTimeFormat.prototype);
    expect(Wrapper.supportedLocalesOf(["en"])).toEqual(["en"]);
    expect(formatter instanceof Wrapper).toBe(true);
    expect(formatter instanceof realNativeDateTimeFormat).toBe(true);
    expect(Object.prototype.toString.call(formatter)).toBe(
      "[object Intl.DateTimeFormat]",
    );
  });
});
