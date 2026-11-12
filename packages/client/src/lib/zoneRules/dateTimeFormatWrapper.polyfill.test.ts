// FR6 of add-zone-rules-from-iana: what temporal-polyfill asks of Intl.DateTimeFormat
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { realNativeDateTimeFormat } from "@/test/installZoneRules";

const ALMATY_ZONE_ID = "Asia/Almaty";
const ALMATY_INSTANT = "2026-07-15T08:00:00Z";
const ALMATY_WALL_CLOCK = "2026-07-15T13:00";

/** Everything the polyfill asks of the engine's formatter, by contract. */
const ZONE_OPTION_KEYS = [
  "calendar",
  "era",
  "day",
  "hour",
  "hour12",
  "minute",
  "month",
  "second",
  "timeZone",
  "year",
];
const ZONE_METHODS = ["formatToParts", "resolvedOptions"];
const LOCALE_STRING_OPTION_KEYS = [...ZONE_OPTION_KEYS, "timeZoneName"].sort();
const LOCALE_STRING_METHODS = ["format", "formatToParts", "resolvedOptions"];
/** The polyfill's own probe at evaluation plus `Temporal.Now.timeZoneId()`. */
const CONSTRUCTIONS_WITHOUT_ZONE_AT_IMPORT = 1;

type Temporal = typeof import("@/lib/temporal").Temporal;

describe("what temporal-polyfill asks of Intl.DateTimeFormat", () => {
  const installedDateTimeFormat = Intl.DateTimeFormat;
  let constructorOptions: (Record<string, unknown> | undefined)[];
  let calledMethods: Set<string>;

  beforeEach(() => {
    constructorOptions = [];
    calledMethods = new Set();
    class LoggingDateTimeFormat extends realNativeDateTimeFormat {
      constructor(
        locales?: string | string[],
        options?: Intl.DateTimeFormatOptions,
      ) {
        super(locales, options);
        constructorOptions.push(options as Record<string, unknown> | undefined);
      }
      override formatToParts(date?: Date | number) {
        calledMethods.add("formatToParts");
        return super.formatToParts(date);
      }
      override resolvedOptions() {
        calledMethods.add("resolvedOptions");
        return super.resolvedOptions();
      }
    }
    const nativeFormatGetter = Object.getOwnPropertyDescriptor(
      realNativeDateTimeFormat.prototype,
      "format",
    )?.get;
    Object.defineProperty(LoggingDateTimeFormat.prototype, "format", {
      configurable: true,
      get() {
        calledMethods.add("format");
        return nativeFormatGetter?.call(this);
      },
    });
    Intl.DateTimeFormat = LoggingDateTimeFormat as typeof Intl.DateTimeFormat;
    vi.resetModules();
  });

  afterEach(() => {
    Intl.DateTimeFormat = installedDateTimeFormat;
    vi.resetModules();
  });

  async function importTemporalFresh(): Promise<Temporal> {
    const { Temporal } = await import("@/lib/temporal");
    return Temporal;
  }

  function getRequestedOptionKeys(): string[] {
    return [
      ...new Set(
        constructorOptions.flatMap((options) => Object.keys(options ?? {})),
      ),
    ].sort();
  }

  function countConstructionsWithoutZone(): number {
    return constructorOptions.filter(
      (options) => options?.timeZone === undefined,
    ).length;
  }

  it("asks for zone offsets with the calendar, zone and field options only", async () => {
    const Temporal = await importTemporalFresh();
    const zoned =
      Temporal.Instant.from(ALMATY_INSTANT).toZonedDateTimeISO(ALMATY_ZONE_ID);
    expect(zoned.timeZoneId).toBe(ALMATY_ZONE_ID);
    for (const disambiguation of ["compatible", "earlier", "later"] as const) {
      Temporal.PlainDateTime.from(ALMATY_WALL_CLOCK).toZonedDateTime(
        ALMATY_ZONE_ID,
        { disambiguation },
      );
    }
    zoned.with({ hour: 9 });
    zoned.add({ days: 1 });

    expect(getRequestedOptionKeys()).toEqual([...ZONE_OPTION_KEYS].sort());
    expect([...calledMethods].sort()).toEqual(ZONE_METHODS);
    expect(countConstructionsWithoutZone()).toBe(
      CONSTRUCTIONS_WITHOUT_ZONE_AT_IMPORT,
    );
  });

  it("asks for the zone name and the format function when it formats text", async () => {
    const Temporal = await importTemporalFresh();
    Temporal.Instant.from(ALMATY_INSTANT)
      .toZonedDateTimeISO(ALMATY_ZONE_ID)
      .toLocaleString("ru");

    expect(getRequestedOptionKeys()).toEqual(LOCALE_STRING_OPTION_KEYS);
    expect([...calledMethods].sort()).toEqual(LOCALE_STRING_METHODS);
  });

  it("reads the device zone from a formatter built without a zone", async () => {
    const Temporal = await importTemporalFresh();
    const constructionsBefore = countConstructionsWithoutZone();
    Temporal.Now.timeZoneId();

    expect(countConstructionsWithoutZone()).toBe(constructionsBefore + 1);
    expect(calledMethods.has("resolvedOptions")).toBe(true);
  });
});
