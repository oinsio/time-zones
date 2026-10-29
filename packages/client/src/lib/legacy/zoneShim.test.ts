// FR4 of support-legacy-ios-12-safari: renamed zones work through their legacy name.
import { afterEach, describe, expect, it } from "vitest";
import {
  createLegacyZoneDateTimeFormat,
  getLegacyZoneNames,
  installLegacyZoneShim,
} from "./zoneShim";

const RENAMED_ZONE_ID = "Europe/Kyiv";
const LEGACY_ZONE_ID = "Europe/Kiev";
const UNKNOWN_RENAMED_ZONE_ID = "America/Ciudad_Juarez";
const INSTANT_MILLISECONDS = Date.UTC(2026, 2, 8, 7, 30);
const LEGACY_NAMES = { [RENAMED_ZONE_ID]: [LEGACY_ZONE_ID] };

const nativeDateTimeFormat = Intl.DateTimeFormat;

/** An engine whose zone data predates the Kyiv rename and lacks Ciudad Juarez. */
function createOutdatedNative(): typeof Intl.DateTimeFormat {
  function OutdatedNative(
    locales?: string | string[],
    options?: Intl.DateTimeFormatOptions,
  ) {
    const rejectedZones = [RENAMED_ZONE_ID, UNKNOWN_RENAMED_ZONE_ID];
    const timeZone = options?.timeZone?.toLowerCase();
    if (rejectedZones.some((zone) => zone.toLowerCase() === timeZone)) {
      throw new RangeError(`Invalid time zone ${options?.timeZone}`);
    }
    return new nativeDateTimeFormat(locales, options);
  }
  Object.defineProperty(OutdatedNative, "prototype", {
    value: nativeDateTimeFormat.prototype,
  });
  const nativeStandIn = Object.assign(OutdatedNative, {
    supportedLocalesOf: nativeDateTimeFormat.supportedLocalesOf,
  }) as unknown as typeof Intl.DateTimeFormat;
  return nativeStandIn;
}

describe("getLegacyZoneNames", () => {
  it("should map a canonical zone to the legacy names that alias it", () => {
    const legacyNames = getLegacyZoneNames({
      "Europe/Kiev": "Europe/Kyiv",
      "Asia/Calcutta": "Asia/Kolkata",
      "Asia/Calcutta2": "Asia/Kolkata",
    });

    expect(legacyNames).toEqual({
      "Europe/Kyiv": ["Europe/Kiev"],
      "Asia/Kolkata": ["Asia/Calcutta", "Asia/Calcutta2"],
    });
  });
});

describe("createLegacyZoneDateTimeFormat", () => {
  const shimmed = createLegacyZoneDateTimeFormat(
    createOutdatedNative(),
    LEGACY_NAMES,
  );

  it.each([RENAMED_ZONE_ID, RENAMED_ZONE_ID.toUpperCase()])(
    "should format %s through the legacy name",
    (timeZone) => {
      const formatter = new shimmed("en-GB", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      });

      expect(formatter.format(INSTANT_MILLISECONDS)).toBe("09:30");
    },
  );

  it("should rethrow the original RangeError when no legacy name is accepted", () => {
    const construct = () =>
      new shimmed("en", { timeZone: UNKNOWN_RENAMED_ZONE_ID });

    expect(construct).toThrow(RangeError);
    expect(construct).toThrow(UNKNOWN_RENAMED_ZONE_ID);
  });

  it("should rethrow the original RangeError when no legacy name is known", () => {
    expect(() => new shimmed("en", { timeZone: "Mars/Olympus" })).toThrow(
      RangeError,
    );
  });

  it("should try the next legacy name when the first is rejected", () => {
    const withTwoNames = createLegacyZoneDateTimeFormat(
      createOutdatedNative(),
      {
        [RENAMED_ZONE_ID]: [UNKNOWN_RENAMED_ZONE_ID, LEGACY_ZONE_ID],
      },
    );

    const formatter = new withTwoNames("en", { timeZone: RENAMED_ZONE_ID });

    expect(formatter.resolvedOptions().timeZone).toBe(LEGACY_ZONE_ID);
  });

  it("should pass a call without a time zone through unchanged", () => {
    const formatter = new shimmed("en", { hour: "numeric" });

    expect(formatter).toBeInstanceOf(nativeDateTimeFormat);
  });

  it("should rethrow an error that is not a RangeError", () => {
    const failing = createLegacyZoneDateTimeFormat(
      Object.assign(function failingNative() {
        throw new TypeError("broken");
      }) as unknown as typeof Intl.DateTimeFormat,
      LEGACY_NAMES,
    );

    expect(() => new failing("en", { timeZone: RENAMED_ZONE_ID })).toThrow(
      TypeError,
    );
  });

  it("should work when called without new", () => {
    const formatter = (
      shimmed as unknown as (
        locales: string,
        options: Intl.DateTimeFormatOptions,
      ) => Intl.DateTimeFormat
    )("en", { timeZone: RENAMED_ZONE_ID });

    expect(formatter.resolvedOptions().timeZone).toBe(LEGACY_ZONE_ID);
  });

  it("should keep supportedLocalesOf and instanceof", () => {
    expect(shimmed.supportedLocalesOf(["en"])).toEqual(["en"]);
    expect(new shimmed("en")).toBeInstanceOf(shimmed);
  });
});

describe("installLegacyZoneShim", () => {
  afterEach(() => {
    Intl.DateTimeFormat = nativeDateTimeFormat;
  });

  it("should replace Intl.DateTimeFormat with a wrapper over the current one", () => {
    installLegacyZoneShim();

    expect(Intl.DateTimeFormat).not.toBe(nativeDateTimeFormat);
    expect(
      new Intl.DateTimeFormat("en", { timeZone: "Europe/Moscow" }).format(0),
    ).toBeTypeOf("string");
  });
});
