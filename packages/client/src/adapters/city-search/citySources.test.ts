// Verifies FR2–FR4 of add-locations-via-search: one contract, every source.
// Verifies FR3, FR11 of add-geonames-city-source (D6) for the GeoNames source.
import zoneCities, { cityData } from "virtual:zone-cities";
import { createAbbreviationSource } from "./abbreviationSource";
import type { GeoNamesCityData } from "./citySource";
import { describeCitySourceContract } from "./citySource.contract";
import { createGeoNamesCitySource } from "./geoNamesCitySource";
import { parseGeoNamesCityData } from "./parseGeoNamesCityData";
import { createZoneCitiesSource } from "./zoneCitiesSource";

const createZoneSource = () => createZoneCitiesSource(zoneCities);

describeCitySourceContract("zone cities", {
  createSource: createZoneSource,
  queries: ["mos", "москва", "kazakhstan", "york"],
});

describeCitySourceContract("abbreviations", {
  createSource: () => createAbbreviationSource(createZoneSource().records),
  queries: ["ist", "est", "msk"],
});

describeCitySourceContract("GeoNames cities", {
  createSource: () =>
    createGeoNamesCitySource(
      parseGeoNamesCityData(cityData) as GeoNamesCityData,
    ),
  queries: ["kazan", "казан", "springfield", "germany"],
});
