/**
 * Compares a refreshed city data file with the committed one for the refresh
 * guard. `isSameData` ignores `source.dumpDate` only.
 * Implements FR2, FR7 of refresh-data-through-scheduled-pull-requests (D5, D6).
 */
import { isDeepStrictEqual } from "node:util";
import type { CityDataset } from "../cityData/cityDataTypes.ts";
import { LARGE_CITY_POPULATION } from "./refreshConstants.ts";

const GEONAME_ID_INDEX = 0;
const ZONE_INDEX_INDEX = 4;
const POPULATION_INDEX = 5;

export type CityDataComparison = {
  isSameData: boolean;
  /** GeoNames IDs of committed cities the refresh lacks. */
  removedCities: number[];
  /** Share of the committed cities the refresh lacks, 0 for none. */
  removedShare: number;
  removedLargeCities: number[];
  removedZones: string[];
};

function collectUsedZones(dataset: CityDataset): Set<string> {
  return new Set(
    dataset.cities.map((cityTuple) =>
      String(dataset.zones[Number(cityTuple[ZONE_INDEX_INDEX])]),
    ),
  );
}

export function compareCityData(
  committed: CityDataset,
  refreshed: CityDataset,
): CityDataComparison {
  const refreshedIds = new Set(
    refreshed.cities.map((cityTuple) => cityTuple[GEONAME_ID_INDEX]),
  );
  const removedTuples = committed.cities.filter(
    (cityTuple) => !refreshedIds.has(cityTuple[GEONAME_ID_INDEX]),
  );
  const refreshedZones = collectUsedZones(refreshed);
  const refreshedWithCommittedDate: CityDataset = {
    ...refreshed,
    source: { ...refreshed.source, dumpDate: committed.source.dumpDate },
  };
  return {
    isSameData: isDeepStrictEqual(committed, refreshedWithCommittedDate),
    removedCities: removedTuples.map(
      (cityTuple) => cityTuple[GEONAME_ID_INDEX],
    ),
    removedShare:
      committed.cities.length === 0
        ? 0
        : removedTuples.length / committed.cities.length,
    removedLargeCities: removedTuples
      .filter(
        (cityTuple) => cityTuple[POPULATION_INDEX] >= LARGE_CITY_POPULATION,
      )
      .map((cityTuple) => cityTuple[GEONAME_ID_INDEX]),
    removedZones: [...collectUsedZones(committed)].filter(
      (zone) => !refreshedZones.has(zone),
    ),
  };
}
