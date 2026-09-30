import {
  POPULAR_TIME_ZONE_IDS,
  REGION_DISPLAY_TYPE,
  UTC_ZONE_ID,
} from "@/constants";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import { canonicalizeTimeZoneId } from "@/model";
import {
  type CityRecord,
  type CitySearchResult,
  SearchMatchKind,
} from "@/ports";
import type { CitySource, ZoneCityData } from "./citySource";
import { normalizeSearchText, splitIntoWords } from "./normalizeSearchText";
import { findAbbreviationsOfZone } from "./timeZoneAbbreviations";

/**
 * One record per browser-known IANA zone, joined with the build-time CLDR
 * city names.
 * Implements FR2, FR3, FR9 of add-locations-via-search (D7).
 */

const ZONE_ID_SEPARATOR = "/";
const UNDERSCORES = /_/g;

/** Zones the browser knows, or `undefined` when it cannot list them. */
export type ListTimeZones = () => readonly string[] | undefined;

const listBrowserTimeZones: ListTimeZones = () =>
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : undefined;

type SearchableText = { normalized: string; words: string[] };

const toSearchableText = (text: string): SearchableText => {
  const normalized = normalizeSearchText(text);
  return { normalized, words: splitIntoWords(normalized) };
};

const startsWithQuery = (text: SearchableText, query: string): boolean =>
  text.normalized.startsWith(query);
const hasWordStartingWithQuery = (text: SearchableText, query: string) =>
  text.words.some((word) => word.startsWith(query));

const deriveNameFromZoneId = (timeZoneId: string): string =>
  (timeZoneId.split(ZONE_ID_SEPARATOR).at(-1) ?? timeZoneId).replace(
    UNDERSCORES,
    " ",
  );

const calculateRank = (timeZoneId: string): number => {
  const popularIndex = POPULAR_TIME_ZONE_IDS.indexOf(timeZoneId);
  return popularIndex === -1 ? 0 : POPULAR_TIME_ZONE_IDS.length - popularIndex;
};

function collectZoneIds(
  zoneCities: readonly ZoneCityData[],
  listTimeZones: ListTimeZones,
): string[] {
  const listedZoneIds =
    listTimeZones() ?? zoneCities.map((zone) => zone.timeZoneId);
  const canonicalZoneIds = [...listedZoneIds, UTC_ZONE_ID].map((zoneId) =>
    canonicalizeTimeZoneId(zoneId),
  );
  return [...new Set(canonicalZoneIds)].filter(
    (zoneId): zoneId is string => zoneId !== undefined,
  );
}

function buildRecord(
  timeZoneId: string,
  dataByZoneId: Map<string, ZoneCityData>,
): CityRecord {
  const data = dataByZoneId.get(timeZoneId);
  const derivedName = deriveNameFromZoneId(timeZoneId);
  return {
    id: timeZoneId,
    timeZoneId,
    names: data?.names ?? { en: derivedName, ru: derivedName },
    countryCode: data?.countryCode ?? "",
    aliases: findAbbreviationsOfZone(timeZoneId),
    rank: calculateRank(timeZoneId),
  };
}

function readCountryTexts(countryCode: string): SearchableText[] {
  if (countryCode === "") return [];
  return SUPPORTED_LANGUAGES.flatMap((language) => {
    const countryName = new Intl.DisplayNames(language, {
      type: REGION_DISPLAY_TYPE,
      fallback: "none",
    }).of(countryCode);
    return countryName === undefined ? [] : [toSearchableText(countryName)];
  });
}

export function createZoneCitiesSource(
  zoneCities: readonly ZoneCityData[],
  listTimeZones: ListTimeZones = listBrowserTimeZones,
): CitySource {
  const dataByZoneId = new Map<string, ZoneCityData>();
  for (const zone of zoneCities) {
    const canonicalZoneId = canonicalizeTimeZoneId(zone.timeZoneId);
    if (canonicalZoneId !== undefined) dataByZoneId.set(canonicalZoneId, zone);
  }
  const records = collectZoneIds(zoneCities, listTimeZones).map((zoneId) =>
    buildRecord(zoneId, dataByZoneId),
  );
  const searchableRecords = records.map((record) => ({
    record,
    cityTexts: SUPPORTED_LANGUAGES.map((language) =>
      toSearchableText(record.names[language]),
    ),
    countryTexts: readCountryTexts(record.countryCode),
  }));

  const findMatchKind = (
    cityTexts: SearchableText[],
    countryTexts: SearchableText[],
    query: string,
  ): SearchMatchKind | undefined => {
    if (cityTexts.some((text) => startsWithQuery(text, query))) {
      return SearchMatchKind.CITY_PREFIX;
    }
    if (cityTexts.some((text) => hasWordStartingWithQuery(text, query))) {
      return SearchMatchKind.CITY_WORD_PREFIX;
    }
    const isCountryMatch = countryTexts.some(
      (text) =>
        startsWithQuery(text, query) || hasWordStartingWithQuery(text, query),
    );
    return isCountryMatch ? SearchMatchKind.COUNTRY : undefined;
  };

  return {
    records,
    match: (normalizedQuery) =>
      searchableRecords.flatMap<CitySearchResult>(
        ({ record, cityTexts, countryTexts }) => {
          const matchKind = findMatchKind(
            cityTexts,
            countryTexts,
            normalizedQuery,
          );
          return matchKind === undefined ? [] : [{ record, matchKind }];
        },
      ),
  };
}
