import timeZoneAliases from "virtual:time-zone-aliases";

/** Legacy names of each canonical zone id, as listed by the alias map. */
export type LegacyZoneNames = Readonly<Record<string, readonly string[]>>;

type DateTimeFormatConstructor = typeof Intl.DateTimeFormat;

/**
 * Inverts the legacy → canonical alias map into canonical → legacy names.
 * Implements FR4 of support-legacy-ios-12-safari.
 */
export function getLegacyZoneNames(
  aliases: Readonly<Record<string, string>>,
): LegacyZoneNames {
  const legacyNames: Record<string, string[]> = {};
  for (const [legacyName, canonicalId] of Object.entries(aliases)) {
    legacyNames[canonicalId] = [
      ...(legacyNames[canonicalId] ?? []),
      legacyName,
    ];
  }
  return legacyNames;
}

function indexByLowerCaseId(legacyNames: LegacyZoneNames) {
  const index = new Map<string, readonly string[]>();
  for (const [canonicalId, names] of Object.entries(legacyNames)) {
    index.set(canonicalId.toLowerCase(), names);
  }
  return index;
}

/**
 * Wraps a native `Intl.DateTimeFormat` so that a canonical zone the engine
 * rejects is retried under each of its legacy names. temporal-polyfill upper-
 * cases the zone before it calls the constructor, so ids match ignoring case.
 * Implements FR4 of support-legacy-ios-12-safari (D4).
 */
export function createLegacyZoneDateTimeFormat(
  nativeDateTimeFormat: DateTimeFormatConstructor,
  legacyNamesByCanonicalId: LegacyZoneNames,
): DateTimeFormatConstructor {
  const legacyNamesByLowerCaseId = indexByLowerCaseId(legacyNamesByCanonicalId);
  function LegacyZoneDateTimeFormat(
    locales?: string | string[],
    options?: Intl.DateTimeFormatOptions,
  ) {
    try {
      return new nativeDateTimeFormat(locales, options);
    } catch (rejection) {
      if (
        !(rejection instanceof RangeError) ||
        options?.timeZone === undefined
      ) {
        throw rejection;
      }
      const legacyNames =
        legacyNamesByLowerCaseId.get(options.timeZone.toLowerCase()) ?? [];
      for (const legacyName of legacyNames) {
        try {
          return new nativeDateTimeFormat(locales, {
            ...options,
            timeZone: legacyName,
          });
        } catch (legacyRejection) {
          if (!(legacyRejection instanceof RangeError)) throw legacyRejection;
        }
      }
      throw rejection;
    }
  }
  Object.defineProperty(LegacyZoneDateTimeFormat, "prototype", {
    value: nativeDateTimeFormat.prototype,
  });
  return Object.assign(LegacyZoneDateTimeFormat, {
    supportedLocalesOf: nativeDateTimeFormat.supportedLocalesOf,
  }) as unknown as DateTimeFormatConstructor;
}

/**
 * Installs the legacy zone shim on `Intl.DateTimeFormat`. Call it before
 * temporal-polyfill is evaluated: the polyfill keeps the constructor it sees.
 * Implements FR4 of support-legacy-ios-12-safari.
 */
export function installLegacyZoneShim(): void {
  Intl.DateTimeFormat = createLegacyZoneDateTimeFormat(
    Intl.DateTimeFormat,
    getLegacyZoneNames(timeZoneAliases),
  );
}
