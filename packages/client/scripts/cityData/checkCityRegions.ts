/**
 * Checks that exactly the namesake cities carry a region.
 * Implements FR12 of add-geonames-city-source (D8).
 */
import type { ZoneCityRecord } from "../zoneData/extractZoneData.ts";
import type { CityDataset } from "./cityDataTypes.ts";
import { NO_RUSSIAN_NAME_MARKER } from "./constants.ts";
import { describeCity } from "./describeCity.ts";
import { findNamesakes, type NamesakeCandidate } from "./markNamesakes.ts";

export function checkRegions(
  dataset: CityDataset,
  zoneCities: ZoneCityRecord[],
): string[] {
  const candidates: NamesakeCandidate[] = dataset.cities.map((city) => ({
    id: String(city[0]),
    countryCode: city[3],
    names: {
      en: city[1],
      ru: city[2] === NO_RUSSIAN_NAME_MARKER ? city[1] : city[2],
    },
    region: undefined,
  }));
  for (const zoneCity of zoneCities) {
    if (zoneCity.countryCode === "") continue;
    candidates.push({
      id: zoneCity.timeZoneId,
      countryCode: zoneCity.countryCode,
      names: zoneCity.names,
      region: undefined,
    });
  }
  const namesakeIds = new Set(
    findNamesakes(candidates).map((candidate) => candidate.id),
  );
  const errors: string[] = [];
  for (const city of dataset.cities) {
    const isNamesake = namesakeIds.has(String(city[0]));
    const hasRegion = city[8] !== undefined;
    if (isNamesake && !hasRegion)
      errors.push(
        `The city ${describeCity(city)} is a namesake without a region`,
      );
    if (!isNamesake && hasRegion)
      errors.push(
        `The city ${describeCity(city)} has a region but is not a namesake`,
      );
  }
  for (const zoneCity of zoneCities) {
    const isNamesake = namesakeIds.has(zoneCity.timeZoneId);
    const hasRegion = zoneCity.timeZoneId in dataset.zoneCityRegions;
    if (isNamesake && !hasRegion)
      errors.push(
        `The zone city ${zoneCity.timeZoneId} is a namesake without a region`,
      );
  }
  for (const zoneId of Object.keys(dataset.zoneCityRegions)) {
    if (!namesakeIds.has(zoneId))
      errors.push(`The zone city ${zoneId} has a region but is not a namesake`);
  }
  return errors;
}
