/**
 * The served form of the committed city data: the cities as columns, with the
 * GeoNames IDs as differences. Columns gzip far better than one tuple per
 * city, which keeps the search data file within its budget.
 * Implements NFR-P1, M2 of add-geonames-city-source (D1, D5).
 */
import type { CityDataset } from "./cityDataTypes.ts";

export const NO_REGION_INDEX = -1;

export type ServedCityData = Omit<CityDataset, "source" | "cities"> & {
  columns: {
    idDifferences: number[];
    englishNames: string[];
    russianNames: (string | 0)[];
    countryCodes: string[];
    zoneIndexes: number[];
    populations: number[];
    regionIndexes: number[];
  };
};

export function toServedCityData(dataset: CityDataset): ServedCityData {
  const { source: _source, cities, ...rest } = dataset;
  let previousId = 0;
  const idDifferences = cities.map(([id]) => {
    const difference = id - previousId;
    previousId = id;
    return difference;
  });
  return {
    ...rest,
    columns: {
      idDifferences,
      englishNames: cities.map((city) => city[1]),
      russianNames: cities.map((city) => city[2]),
      countryCodes: cities.map((city) => city[3]),
      zoneIndexes: cities.map((city) => city[4]),
      populations: cities.map((city) => city[5]),
      regionIndexes: cities.map((city) => city[6] ?? NO_REGION_INDEX),
    },
  };
}
