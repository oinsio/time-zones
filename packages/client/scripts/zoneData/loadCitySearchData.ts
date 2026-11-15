/**
 * The search data served to the app: the zone cities from CLDR and the
 * committed city data without its `source` record, read once.
 * Implements FR14 of add-geonames-city-source (D1, D5).
 * Implements FR3, FR5 of add-city-coordinates-to-locations (D3): the zone cities
 * carry the committed zone coordinates, joined by zone ID.
 */
import { readFileSync } from "node:fs";
import { ZONE_COORDINATES_FILE } from "../../app.config.ts";
import type { CityDataset } from "../cityData/cityDataTypes.ts";
import {
  type ServedCityData,
  toServedCityData,
} from "../cityData/toServedCityData.ts";
import type { ZoneCityRecord } from "./extractZoneData.ts";
import { loadZoneData } from "./loadZoneData.ts";

/** A zone city as served: UTC and a zone the file lacks carry no coordinates. */
export type ServedZoneCity = ZoneCityRecord & {
  latitudeTenths?: number;
  longitudeTenths?: number;
};

export type CitySearchData = {
  zoneCities: ServedZoneCity[];
  cityData: ServedCityData;
};

type ZoneCoordinatesDocument = { zones: Record<string, [number, number]> };

function joinZoneCoordinates(zoneCities: ZoneCityRecord[]): ServedZoneCity[] {
  const { zones } = JSON.parse(
    readFileSync(ZONE_COORDINATES_FILE, "utf8"),
  ) as ZoneCoordinatesDocument;
  return zoneCities.map((zoneCity) => {
    const tenths = Object.hasOwn(zones, zoneCity.timeZoneId)
      ? zones[zoneCity.timeZoneId]
      : undefined;
    if (tenths === undefined) return zoneCity;
    return {
      ...zoneCity,
      latitudeTenths: tenths[0],
      longitudeTenths: tenths[1],
    };
  });
}

let cachedCitySearchData: CitySearchData | undefined;

export function loadCitySearchData(datasetFilePath: string): CitySearchData {
  if (cachedCitySearchData === undefined) {
    const dataset = JSON.parse(
      readFileSync(datasetFilePath, "utf8"),
    ) as CityDataset;
    cachedCitySearchData = {
      zoneCities: joinZoneCoordinates(loadZoneData().zoneCities),
      cityData: toServedCityData(dataset),
    };
  }
  return cachedCitySearchData;
}
