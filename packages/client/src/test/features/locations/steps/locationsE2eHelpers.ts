import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, type Page } from "@playwright/test";
import { englishLocale } from "../../main_page/steps/englishTexts";
import {
  DEVICE_TIME_ENTRY,
  type StoredEntry,
  type StoredLocation,
} from "./locations_ui_e2e.fixtures";

const UTC_ZONE_ID = "UTC";
const RUSSIAN_LOCALE_FILE = join(process.cwd(), "src", "locales", "ru.json");
const russianLocations = (
  JSON.parse(readFileSync(RUSSIAN_LOCALE_FILE, "utf8")) as {
    locations: Record<string, string>;
  }
).locations;

/** Either interface language, so scenarios in English and Russian find the control. */
const eitherLanguage = (englishText: string, russianText: string) =>
  new RegExp(`^(${englishText}|${russianText})$`);

export const ADD_LOCATION_NAME = englishLocale.locations.addLocation;
export const SEARCH_LABEL = englishLocale.locations.searchLabel;
export const SUGGESTIONS_HEADING = englishLocale.locations.suggestionsHeading;
export const NO_RESULTS_TEXT = englishLocale.locations.noResults;
export const SEARCH_LOAD_ERROR_TEXT = englishLocale.locations.searchLoadError;
export const SEARCH_LOADING_TEXT = englishLocale.locations.searchLoading;
export const RETRY_NAME = englishLocale.locations.retry;
export const SCREEN_HEIGHT_PX = 800;
export const UNREADABLE_DOCUMENT_TEXT = "{not json";

/** Any valid place: a stored entry that holds coordinates is never filled, so never rewritten. */
const SEEDED_COORDINATES = { latitude: 0, longitude: 0 };

/**
 * Where each seeded city is, so that its day tracks and cells follow the sun of
 * that place (FR7 of bind-day-periods-to-sun). A zone not listed gets
 * `SEEDED_COORDINATES`; UTC has none.
 */
const COORDINATES_BY_ZONE: Record<
  string,
  { latitude: number; longitude: number }
> = {
  "Asia/Almaty": { latitude: 43.3, longitude: 76.9 },
  "Europe/Moscow": { latitude: 55.8, longitude: 37.6 },
  "Asia/Kolkata": { latitude: 22.5, longitude: 88.4 },
  "America/New_York": { latitude: 40.7, longitude: -74.0 },
  "Asia/Tokyo": { latitude: 35.7, longitude: 139.7 },
  "Asia/Kathmandu": { latitude: 27.7, longitude: 85.3 },
  "Europe/Belgrade": { latitude: 44.8, longitude: 20.5 },
  "Australia/Lord_Howe": { latitude: -31.5, longitude: 159.1 },
  "America/Chicago": { latitude: 41.9, longitude: -87.6 },
  "Europe/London": { latitude: 51.5, longitude: -0.1 },
  "Australia/Adelaide": { latitude: -34.9, longitude: 138.6 },
  "America/St_Vincent": { latitude: 13.2, longitude: -61.2 },
};

const KNOWN_CITIES: Record<string, StoredLocation> = {
  Almaty: { timeZoneId: "Asia/Almaty", label: "Almaty", countryCode: "KZ" },
  Moscow: { timeZoneId: "Europe/Moscow", label: "Moscow", countryCode: "RU" },
  Москва: {
    timeZoneId: "Europe/Moscow",
    label: "Москва",
    countryCode: "RU",
  },
  Алматы: { timeZoneId: "Asia/Almaty", label: "Алматы", countryCode: "KZ" },
  Катманду: {
    timeZoneId: "Asia/Kathmandu",
    label: "Катманду",
    countryCode: "NP",
  },
  Токио: { timeZoneId: "Asia/Tokyo", label: "Токио", countryCode: "JP" },
  Калькутта: {
    timeZoneId: "Asia/Kolkata",
    label: "Калькутта",
    countryCode: "IN",
  },
  Kolkata: { timeZoneId: "Asia/Kolkata", label: "Kolkata", countryCode: "IN" },
  Kathmandu: {
    timeZoneId: "Asia/Kathmandu",
    label: "Kathmandu",
    countryCode: "NP",
  },
  Tokyo: { timeZoneId: "Asia/Tokyo", label: "Tokyo", countryCode: "JP" },
  UTC: { timeZoneId: "UTC", label: "UTC", countryCode: "" },
  "New York": {
    timeZoneId: "America/New_York",
    label: "New York",
    countryCode: "US",
  },
  Belgrade: {
    timeZoneId: "Europe/Belgrade",
    label: "Belgrade",
    countryCode: "RS",
  },
  Белград: {
    timeZoneId: "Europe/Belgrade",
    label: "Белград",
    countryCode: "RS",
  },
  "Lord Howe Island": {
    timeZoneId: "Australia/Lord_Howe",
    label: "Lord Howe Island",
    countryCode: "AU",
  },
  "Лорд-Хау": {
    timeZoneId: "Australia/Lord_Howe",
    label: "Лорд-Хау",
    countryCode: "AU",
  },
  Chicago: {
    timeZoneId: "America/Chicago",
    label: "Chicago",
    countryCode: "US",
  },
  London: { timeZoneId: "Europe/London", label: "London", countryCode: "GB" },
  Adelaide: {
    timeZoneId: "Australia/Adelaide",
    label: "Adelaide",
    countryCode: "AU",
  },
  "St. Vincent": {
    timeZoneId: "America/St_Vincent",
    label: "St. Vincent",
    countryCode: "VC",
  },
  "Петропавловск-Камчатский": {
    timeZoneId: "Asia/Kamchatka",
    label: "Петропавловск-Камчатский",
    countryCode: "RU",
  },
};

/** The scenario phrase for the device time location in a stored list. */
export const DEVICE_TIME_LIST_PHRASE = "the device time location";

/** Turns city names into stored entries; fails on a city the table lacks. */
export function buildStoredLocations(cityNames: string[]): StoredEntry[] {
  return cityNames.map((cityName) => {
    if (cityName === DEVICE_TIME_LIST_PHRASE) return DEVICE_TIME_ENTRY;
    const knownCity = KNOWN_CITIES[cityName];
    if (!knownCity) throw new Error(`Unknown city in a scenario: ${cityName}`);
    if (knownCity.timeZoneId === UTC_ZONE_ID) return knownCity;
    return {
      ...knownCity,
      coordinates:
        COORDINATES_BY_ZONE[knownCity.timeZoneId] ?? SEEDED_COORDINATES,
    };
  });
}

/** Splits `"Almaty", "Moscow"` into city names. */
export function parseCityNames(quotedNames: string): string[] {
  return [...quotedNames.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

export const addLocationButton = (page: Page) =>
  page.getByRole("button", {
    name: eitherLanguage(ADD_LOCATION_NAME, russianLocations.addLocation),
  });

export const queryField = (page: Page) =>
  page.getByRole("combobox", {
    name: eitherLanguage(SEARCH_LABEL, russianLocations.searchLabel),
  });

export async function openSearch(page: Page) {
  await addLocationButton(page).click();
  await expect(queryField(page)).toBeVisible();
}

export async function typeQuery(page: Page, query: string) {
  await queryField(page).fill(query);
}

export const resultOption = (page: Page, cityName: string) =>
  page.getByRole("option", { name: new RegExp(`^${cityName}`) });

export const listRow = (page: Page, cityName: string) =>
  page.getByRole("listitem").filter({ hasText: cityName });

export const menuButton = (page: Page, cityName: string) =>
  page.getByRole("button", { name: `Actions for ${cityName}` });

/** Removes a location the way a user does: the menu of its card, then "Remove". */
export async function removeThroughMenu(page: Page, cityName: string) {
  await menuButton(page, cityName).click();
  await page.getByRole("menuitem", { name: "Remove" }).click();
}
