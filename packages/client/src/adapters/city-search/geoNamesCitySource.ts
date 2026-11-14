import { canonicalizeTimeZoneId } from "@/model";
import type { CityRecord } from "@/ports";
import type { CitySource, GeoNamesCityData } from "./citySource";
import {
  createCountryTextCache,
  createRecordMatcher,
  type ListTimeZones,
  listKnownZones,
  type ReadCountryTexts,
} from "./cityTextMatching";

/**
 * The GeoNames cities as a city source (ADR-0006): records carry the GeoNames
 * ID, rank 0, the population and, for namesakes, the region. Cities whose zone
 * the installed release does not hold are skipped. Searchable texts are built
 * on the first match, so loading normalizes nothing.
 * Implements FR3, FR11 of add-geonames-city-source (D6).
 */
export function createGeoNamesCitySource(
  cityData: GeoNamesCityData,
  listTimeZones: ListTimeZones = listKnownZones,
  readCountryTexts: ReadCountryTexts = createCountryTextCache(),
): CitySource {
  const listedZones = listTimeZones();
  const knownZoneIds =
    listedZones === undefined
      ? undefined
      : new Set(listedZones.map((zoneId) => canonicalizeTimeZoneId(zoneId)));
  const records = cityData.cities
    .filter(
      (city) => knownZoneIds === undefined || knownZoneIds.has(city.timeZoneId),
    )
    .map(
      (city): CityRecord => ({
        id: city.id,
        timeZoneId: city.timeZoneId,
        names: city.names,
        countryCode: city.countryCode,
        aliases: [],
        rank: 0,
        population: city.population,
        ...(city.region === undefined ? {} : { region: city.region }),
      }),
    );
  return { records, match: createRecordMatcher(records, readCountryTexts) };
}
