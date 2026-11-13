import { POPULAR_TIME_ZONE_IDS, UTC_ZONE_ID } from "@/constants";
import { canonicalizeTimeZoneId, getZoneAbbreviations } from "@/model";
import type { CityRecord } from "@/ports";
import {
  type CitySource,
  EMPTY_GEONAMES_CITY_DATA,
  type GeoNamesCityData,
  type ZoneCityData,
} from "./citySource";
import {
  createCountryTextCache,
  createRecordMatcher,
  type ListTimeZones,
  listKnownZones,
  type ReadCountryTexts,
} from "./cityTextMatching";
import { deriveCityNameFromTimeZoneId } from "./deriveCityNameFromTimeZoneId";

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
  cityData: GeoNamesCityData,
): CityRecord {
  const data = dataByZoneId.get(timeZoneId);
  const derivedName = deriveCityNameFromTimeZoneId(timeZoneId);
  const region = cityData.zoneCityRegions[timeZoneId];
  return {
    id: timeZoneId,
    timeZoneId,
    names: data?.names ?? { en: derivedName, ru: derivedName },
    countryCode: data?.countryCode ?? "",
    aliases: getZoneAbbreviations(timeZoneId),
    rank: calculateRank(timeZoneId),
    population: cityData.zoneCityPopulations[timeZoneId] ?? 0,
    ...(region === undefined ? {} : { region }),
  };
}

/**
 * One record per zone of the installed release, joined with the build-time CLDR
 * city names.
 * Implements FR2, FR3, FR9 of add-locations-via-search (D7).
 * Implements FR5, FR10 of add-interface-language-selection (D5): names in the language fallback order.
 * Implements FR8 of show-zone-abbreviations-and-zone-label-setting (D8): the aliases are the abbreviation pair.
 * Implements FR5, FR7 of add-geonames-city-source (D2, D6): population and region from the city data.
 */
export function createZoneCitiesSource(
  zoneCities: readonly ZoneCityData[],
  listTimeZones: ListTimeZones = listKnownZones,
  cityData: GeoNamesCityData = EMPTY_GEONAMES_CITY_DATA,
  readCountryTexts: ReadCountryTexts = createCountryTextCache(),
): CitySource {
  const dataByZoneId = new Map<string, ZoneCityData>();
  for (const zone of zoneCities) {
    const canonicalZoneId = canonicalizeTimeZoneId(zone.timeZoneId);
    if (canonicalZoneId !== undefined) dataByZoneId.set(canonicalZoneId, zone);
  }
  const records = collectZoneIds(zoneCities, listTimeZones).map((zoneId) =>
    buildRecord(zoneId, dataByZoneId, cityData),
  );
  return { records, match: createRecordMatcher(records, readCountryTexts) };
}
