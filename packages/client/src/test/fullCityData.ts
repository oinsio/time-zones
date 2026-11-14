import zoneCities, { cityData } from "virtual:zone-cities";
import { parseCitySearchData } from "@/adapters/city-search";

/**
 * The committed GeoNames city data, validated and expanded as the loader does,
 * for the scenarios and measurements about the whole search.
 * Implements FR3, FR14 of add-geonames-city-source (D5).
 */
export const fullCityData = parseCitySearchData({
  zoneCities,
  cityData,
}).cityData;
