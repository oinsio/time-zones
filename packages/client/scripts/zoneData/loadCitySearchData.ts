/**
 * The search data served to the app: the zone cities from CLDR and the
 * committed city data without its `source` record, read once.
 * Implements FR14 of add-geonames-city-source (D1, D5).
 */
import { readFileSync } from "node:fs";
import type { CityDataset } from "../cityData/cityDataTypes.ts";
import {
  type ServedCityData,
  toServedCityData,
} from "../cityData/toServedCityData.ts";
import type { ZoneCityRecord } from "./extractZoneData.ts";
import { loadZoneData } from "./loadZoneData.ts";

export type CitySearchData = {
  zoneCities: ZoneCityRecord[];
  cityData: ServedCityData;
};

let cachedCitySearchData: CitySearchData | undefined;

export function loadCitySearchData(datasetFilePath: string): CitySearchData {
  if (cachedCitySearchData === undefined) {
    const dataset = JSON.parse(
      readFileSync(datasetFilePath, "utf8"),
    ) as CityDataset;
    cachedCitySearchData = {
      zoneCities: loadZoneData().zoneCities,
      cityData: toServedCityData(dataset),
    };
  }
  return cachedCitySearchData;
}
