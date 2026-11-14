import type { CityNameLanguage } from "@/constants";
import type { GeoNamesCityEntry } from "./citySource";
import { city } from "./compositeCityFixtures";
import { createCompositeCitySearch } from "./createCompositeCitySearch";

/** Implements FR3–FR6, FR9 of add-geonames-city-source (D7): zone cities plus GeoNames cities. */
export const geoNamesCity = (
  id: string,
  en: string,
  ru: string,
  countryCode: string,
  timeZoneId: string,
  population: number,
  region?: Record<CityNameLanguage, string>,
): GeoNamesCityEntry => ({
  id,
  names: { en, ru },
  countryCode,
  timeZoneId,
  population,
  ...(region === undefined ? {} : { region }),
});

const ILLINOIS = { en: "Illinois", ru: "Иллинойс" };
const MISSOURI = { en: "Missouri", ru: "Миссури" };

export const zoneCities = [
  city("Europe/Moscow", "Moscow", "Москва", "RU"),
  city("America/New_York", "New York", "Нью-Йорк", "US"),
  city("America/Chicago", "Chicago", "Чикаго", "US"),
  city("Asia/Yekaterinburg", "Yekaterinburg", "Екатеринбург", "RU"),
];

export const cityData = {
  cities: [
    geoNamesCity("551487", "Kazan", "Казань", "RU", "Europe/Moscow", 1_243_500),
    geoNamesCity(
      "4250542",
      "Springfield",
      "Спрингфилд",
      "US",
      "America/Chicago",
      114_394,
      ILLINOIS,
    ),
    geoNamesCity(
      "4409896",
      "Springfield",
      "Спрингфилд",
      "US",
      "America/Chicago",
      170_188,
      MISSOURI,
    ),
    geoNamesCity(
      "5101798",
      "Newark",
      "Ньюарк",
      "US",
      "America/New_York",
      311_549,
    ),
    geoNamesCity(
      "11",
      "Nashville",
      "Нашвилл",
      "US",
      "America/Chicago",
      200_000,
    ),
    geoNamesCity("12", "Nassau", "Нассау", "US", "America/Chicago", 200_000),
  ],
  zoneCityPopulations: {
    "Europe/Moscow": 10_381_222,
    "America/New_York": 8_804_190,
  },
  zoneCityRegions: {},
};

export const fullSearch = createCompositeCitySearch(zoneCities, cityData);
const fixtureIds = new Set([
  ...zoneCities.map((record) => record.timeZoneId),
  ...cityData.cities.map((record) => record.id),
]);

/** Result IDs of the fixture cities only: the zone source also lists every zone of the installed release. */
export const resultIds = (query: string, language: CityNameLanguage = "en") =>
  fullSearch
    .search(query, language)
    .map((result) => result.record.id)
    .filter((id) => fixtureIds.has(id));
