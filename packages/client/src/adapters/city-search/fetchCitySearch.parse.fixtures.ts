/**
 * Fixtures of the city search data parse tests.
 * Verifies FR5 of add-city-coordinates-to-locations (D2, D5).
 */
import { parseCitySearchData } from "./fetchCitySearch";

export const validRecord = {
  timeZoneId: "Europe/Moscow",
  names: { en: "Moscow", ru: "Москва" },
  countryCode: "RU",
};
export type Tuple = unknown[];
/** The served columns of city tuples: IDs as differences, -1 for no region. */
export const columnsOf = (tuples: Tuple[]) => {
  let previousId = 0;
  return {
    idDifferences: tuples.map(([id]) => {
      const difference = Number(id) - previousId;
      previousId = Number(id);
      return difference;
    }),
    englishNames: tuples.map((tuple) => tuple[1]),
    russianNames: tuples.map((tuple) => tuple[2]),
    countryCodes: tuples.map((tuple) => tuple[3]),
    zoneIndexes: tuples.map((tuple) => tuple[4]),
    populations: tuples.map((tuple) => tuple[5]),
    latitudeTenths: tuples.map((tuple) => tuple[6]),
    longitudeTenths: tuples.map((tuple) => tuple[7]),
    regionIndexes: tuples.map((tuple) => tuple[8] ?? -1),
  };
};
export const validTuples: Tuple[] = [
  [551487, "Kazan", "Казань", "RU", 0, 1243500, 558, 491],
  [4250542, "Springfield", 0, "US", 0, 114394, -2, -785, 0],
];
export const validCityData = {
  zones: ["Europe/Moscow"],
  regions: [["Illinois", "Иллинойс"]],
  columns: columnsOf(validTuples),
  zoneCityPopulations: { "Europe/Moscow": 10381222 },
  zoneCityRegions: { "Europe/Moscow": 0 },
};
export const toCityData = (overrides: Record<string, unknown>) => {
  const { cities, ...others } = overrides;
  return {
    ...validCityData,
    ...(cities === undefined ? {} : { columns: columnsOf(cities as Tuple[]) }),
    ...others,
  };
};
export const parse = (overrides: Record<string, unknown> = {}) =>
  parseCitySearchData({
    zoneCities: [validRecord],
    cityData: toCityData(overrides),
  });
