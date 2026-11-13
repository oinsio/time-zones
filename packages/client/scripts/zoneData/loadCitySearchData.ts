/**
 * The search data served to the app: the zone cities from CLDR and the
 * committed city data without its `source` record, read once.
 * Implements FR14 of add-geonames-city-source (D1, D5).
 */
import { readFileSync } from "node:fs";
import type { CityDataset } from "../cityData/cityDataTypes.ts";
import type { ZoneCityRecord } from "./extractZoneData.ts";
import { loadZoneData } from "./loadZoneData.ts";

export type CitySearchData = {
  zoneCities: ZoneCityRecord[];
  cityData: Omit<CityDataset, "source">;
};

let cachedCitySearchData: CitySearchData | undefined;

export function loadCitySearchData(datasetFilePath: string): CitySearchData {
  if (cachedCitySearchData === undefined) {
    const { source: _source, ...cityData } = JSON.parse(
      readFileSync(datasetFilePath, "utf8"),
    ) as CityDataset;
    cachedCitySearchData = { zoneCities: loadZoneData().zoneCities, cityData };
  }
  return cachedCitySearchData;
}
