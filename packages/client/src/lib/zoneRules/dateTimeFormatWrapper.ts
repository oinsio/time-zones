/**
 * The zone rules wrapper: an `Intl.DateTimeFormat` that answers every zone the
 * release knows from the zone rules and uses the native formatter, set to UTC,
 * for locale, calendar and numbering. Each date is shifted by the offset of its
 * local time type before the native formatter sees it. A zone the release does
 * not know reaches the native constructor unchanged.
 * Implements FR1, FR6, NFR-P3 of add-zone-rules-from-iana (design D5).
 */

import {
  getLocalTimeType,
  type LocalTimeType,
  type ZoneRules,
  type ZoneRulesRelease,
} from "./core/index.ts";
import { createCurrentInstantReader } from "./currentInstant.ts";
import { formatZoneName, replaceZoneNameParts } from "./zoneNameParts.ts";

type DateTimeFormatConstructor = typeof Intl.DateTimeFormat;
type DateArgument = Date | number | undefined;

const UTC_TIME_ZONE = "UTC";
const MILLISECONDS_PER_SECOND = 1000;

type ZoneFormatterState = {
  zoneId: string;
  rules: ZoneRules;
  utcFormatter: Intl.DateTimeFormat;
  readCurrentInstant: () => number;
};

function toEpochMilliseconds(
  date: DateArgument,
  readCurrentInstant: () => number,
): number {
  if (date === undefined) return readCurrentInstant();
  return typeof date === "number" ? date : date.valueOf();
}

function getLocalTimeTypeAt(
  state: ZoneFormatterState,
  epochMilliseconds: number,
): LocalTimeType {
  return getLocalTimeType(
    state.rules,
    Math.floor(epochMilliseconds / MILLISECONDS_PER_SECOND),
  );
}

function shiftByOffset(
  epochMilliseconds: number,
  localTimeType: LocalTimeType,
): number {
  return (
    epochMilliseconds + localTimeType.utcOffsetSeconds * MILLISECONDS_PER_SECOND
  );
}

function createFormatToParts(state: ZoneFormatterState) {
  return (date?: DateArgument): Intl.DateTimeFormatPart[] => {
    const epochMilliseconds = toEpochMilliseconds(
      date,
      state.readCurrentInstant,
    );
    const localTimeType = getLocalTimeTypeAt(state, epochMilliseconds);
    return replaceZoneNameParts(
      state.utcFormatter.formatToParts(
        shiftByOffset(epochMilliseconds, localTimeType),
      ),
      formatZoneName(localTimeType),
    );
  };
}

function createFormatRangeToParts(state: ZoneFormatterState) {
  return (start: DateArgument, end: DateArgument) => {
    const startMilliseconds = toEpochMilliseconds(
      start,
      state.readCurrentInstant,
    );
    const endMilliseconds = toEpochMilliseconds(end, state.readCurrentInstant);
    const startType = getLocalTimeTypeAt(state, startMilliseconds);
    const endType = getLocalTimeTypeAt(state, endMilliseconds);
    const parts = state.utcFormatter.formatRangeToParts(
      shiftByOffset(startMilliseconds, startType),
      shiftByOffset(endMilliseconds, endType),
    );
    return parts.map(
      (part) =>
        replaceZoneNameParts(
          [part],
          formatZoneName(part.source === "startRange" ? startType : endType),
        )[0],
    );
  };
}

function joinParts(parts: { value: string }[]): string {
  return parts.map((part) => part.value).join("");
}

function createZoneFormatter(
  nativeDateTimeFormat: DateTimeFormatConstructor,
  state: ZoneFormatterState,
): Intl.DateTimeFormat {
  const formatToParts = createFormatToParts(state);
  const formatter = Object.create(nativeDateTimeFormat.prototype);
  Object.defineProperties(formatter, {
    formatToParts: { value: formatToParts, configurable: true, writable: true },
    format: {
      value: (date?: DateArgument) => joinParts(formatToParts(date)),
      configurable: true,
      writable: true,
    },
    resolvedOptions: {
      value: () => ({
        ...state.utcFormatter.resolvedOptions(),
        timeZone: state.zoneId,
      }),
      configurable: true,
      writable: true,
    },
  });
  if (typeof nativeDateTimeFormat.prototype.formatRangeToParts === "function") {
    const formatRangeToParts = createFormatRangeToParts(state);
    Object.defineProperties(formatter, {
      formatRangeToParts: {
        value: formatRangeToParts,
        configurable: true,
        writable: true,
      },
      formatRange: {
        value: (start: DateArgument, end: DateArgument) =>
          joinParts(formatRangeToParts(start, end)),
        configurable: true,
        writable: true,
      },
    });
  }
  return formatter;
}

function indexZoneIdsByLowerCase(
  release: ZoneRulesRelease,
): Map<string, string> {
  return new Map(
    [...release.zones.keys()].map((zoneId) => [zoneId.toLowerCase(), zoneId]),
  );
}

/**
 * A constructor that behaves as `Intl.DateTimeFormat` over `nativeDateTimeFormat`
 * for every zone outside the release, and answers from the release for the rest.
 * temporal-polyfill upper-cases the zone before it constructs, so ids match
 * ignoring case; the instance keeps the id in the release's spelling.
 */
export function createZoneRulesDateTimeFormat(
  nativeDateTimeFormat: DateTimeFormatConstructor,
  release: ZoneRulesRelease,
): DateTimeFormatConstructor {
  const zoneIdsByLowerCase = indexZoneIdsByLowerCase(release);
  const readCurrentInstant = createCurrentInstantReader(nativeDateTimeFormat);
  function ZoneRulesDateTimeFormat(
    locales?: string | string[],
    options?: Intl.DateTimeFormatOptions,
  ) {
    const zoneId = zoneIdsByLowerCase.get(
      options?.timeZone?.toLowerCase() ?? "",
    );
    const rules = zoneId === undefined ? undefined : release.zones.get(zoneId);
    if (zoneId === undefined || rules === undefined) {
      return new nativeDateTimeFormat(locales, options);
    }
    const utcFormatter = new nativeDateTimeFormat(locales, {
      ...options,
      timeZone: UTC_TIME_ZONE,
    });
    return createZoneFormatter(nativeDateTimeFormat, {
      zoneId,
      rules,
      utcFormatter,
      readCurrentInstant,
    });
  }
  Object.defineProperty(ZoneRulesDateTimeFormat, "prototype", {
    value: nativeDateTimeFormat.prototype,
  });
  return Object.assign(ZoneRulesDateTimeFormat, {
    supportedLocalesOf: nativeDateTimeFormat.supportedLocalesOf,
  }) as unknown as DateTimeFormatConstructor;
}
