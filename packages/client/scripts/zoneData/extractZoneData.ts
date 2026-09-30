/**
 * Pure extraction of the zone-cities records and the legacy-alias map from
 * CLDR JSON. Implements FR1, FR2, FR3, FR9 of add-locations-via-search (D6).
 */

export type ZoneCityRecord = {
  timeZoneId: string;
  names: { en: string; ru: string };
  countryCode: string;
};

export type TimeZoneAliases = Record<string, string>;

export type ZoneDataInput = {
  bcp47TimeZones: unknown;
  englishZoneNames: unknown;
  russianZoneNames: unknown;
};

export type ZoneData = {
  zoneCities: ZoneCityRecord[];
  timeZoneAliases: TimeZoneAliases;
};

type Bcp47ZoneEntry = { _alias?: string; _iana?: string };
type ZoneNameNode = { exemplarCity?: string } & Record<string, unknown>;

const UTC_KEY = "utc";
const UTC_ZONE_ID = "UTC";
const ETC_AREA = "Etc";
const ALIAS_SEPARATOR = " ";
const ZONE_ID_SEPARATOR = "/";
const COUNTRY_CODE_LENGTH = 2;
const KEY_PREFIX_OF_METADATA = "_";
const REGION_DISPLAY_LANGUAGE = "en";

/** Keys whose first two letters are not their ISO 3166 region (CLDR 48). */
const COUNTRY_CODE_OVERRIDES: Record<string, string> = {
  jeruslm: "IL",
  gazastrp: "PS",
  hebron: "PS",
  gpmsb: "MF",
  gpsbh: "BL",
};

function readRecord(
  value: unknown,
  description: string,
): Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    throw new Error(`CLDR data is missing ${description}`);
  }
  return value as Record<string, unknown>;
}

function readBcp47Zones(
  bcp47TimeZones: unknown,
): Record<string, Bcp47ZoneEntry> {
  const root = readRecord(bcp47TimeZones, "keyword");
  const keyword = readRecord(root.keyword, "keyword");
  const unicodeKeywords = readRecord(keyword.u, "keyword.u");
  return readRecord(unicodeKeywords.tz, "keyword.u.tz") as Record<
    string,
    Bcp47ZoneEntry
  >;
}

function readZoneNames(zoneNames: unknown): Record<string, unknown> {
  const root = readRecord(zoneNames, "main");
  const [localeEntry] = Object.values(readRecord(root.main, "main"));
  const dates = readRecord(readRecord(localeEntry, "locale").dates, "dates");
  const timeZoneNames = readRecord(dates.timeZoneNames, "timeZoneNames");
  return readRecord(timeZoneNames.zone, "timeZoneNames.zone");
}

function findExemplarCity(
  zoneNames: Record<string, unknown>,
  cldrZoneId: string,
): string | undefined {
  let node: unknown = zoneNames;
  for (const segment of cldrZoneId.split(ZONE_ID_SEPARATOR)) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  const exemplarCity = (node as ZoneNameNode | undefined)?.exemplarCity;
  return typeof exemplarCity === "string" ? exemplarCity : undefined;
}

function deriveCityFromZoneId(canonicalZoneId: string): string {
  return (
    canonicalZoneId.split(ZONE_ID_SEPARATOR).at(-1)?.replaceAll("_", " ") ?? ""
  );
}

function resolveCountryCode(
  key: string,
  canonicalZoneId: string,
  regionNames: Intl.DisplayNames,
): string {
  const isRegionalZone =
    canonicalZoneId.includes(ZONE_ID_SEPARATOR) &&
    !canonicalZoneId.startsWith(`${ETC_AREA}${ZONE_ID_SEPARATOR}`);
  if (!isRegionalZone) return "";
  const countryCode =
    COUNTRY_CODE_OVERRIDES[key] ??
    key.slice(0, COUNTRY_CODE_LENGTH).toUpperCase();
  return regionNames.of(countryCode) === undefined ? "" : countryCode;
}

export function extractZoneData(input: ZoneDataInput): ZoneData {
  const bcp47Zones = readBcp47Zones(input.bcp47TimeZones);
  const englishNames = readZoneNames(input.englishZoneNames);
  const russianNames = readZoneNames(input.russianZoneNames);
  const regionNames = new Intl.DisplayNames(REGION_DISPLAY_LANGUAGE, {
    type: "region",
    fallback: "none",
  });
  const zoneCities: ZoneCityRecord[] = [];
  const timeZoneAliases: TimeZoneAliases = {};

  for (const [key, entry] of Object.entries(bcp47Zones)) {
    if (key.startsWith(KEY_PREFIX_OF_METADATA)) continue;
    if (typeof entry._alias !== "string") continue;
    const aliases = entry._alias.split(ALIAS_SEPARATOR);
    const [cldrZoneId] = aliases;
    if (!cldrZoneId) continue;
    const canonicalZoneId =
      key === UTC_KEY ? UTC_ZONE_ID : (entry._iana ?? cldrZoneId);
    for (const alias of aliases) {
      if (alias !== canonicalZoneId) timeZoneAliases[alias] = canonicalZoneId;
    }
    if (canonicalZoneId.startsWith(`${ETC_AREA}${ZONE_ID_SEPARATOR}`)) continue;
    const englishName =
      findExemplarCity(englishNames, cldrZoneId) ??
      deriveCityFromZoneId(canonicalZoneId);
    zoneCities.push({
      timeZoneId: canonicalZoneId,
      names: {
        en: englishName,
        ru: findExemplarCity(russianNames, cldrZoneId) ?? englishName,
      },
      countryCode: resolveCountryCode(key, canonicalZoneId, regionNames),
    });
  }
  return { zoneCities, timeZoneAliases };
}
