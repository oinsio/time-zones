import { expect, type Page } from "@playwright/test";
import { englishLocale } from "../../main_page/steps/englishTexts";
import type { StoredLocation } from "./locations_ui_e2e.fixtures";

export const ADD_LOCATION_NAME = englishLocale.locations.addLocation;
export const SEARCH_LABEL = englishLocale.locations.searchLabel;
export const SUGGESTIONS_HEADING = englishLocale.locations.suggestionsHeading;
export const NO_RESULTS_TEXT = englishLocale.locations.noResults;
export const SEARCH_LOAD_ERROR_TEXT = englishLocale.locations.searchLoadError;
export const SEARCH_LOADING_TEXT = englishLocale.locations.searchLoading;
export const RETRY_NAME = englishLocale.locations.retry;
export const SCREEN_HEIGHT_PX = 800;
export const UNREADABLE_DOCUMENT_TEXT = "{not json";

const KNOWN_CITIES: Record<string, StoredLocation> = {
  Almaty: { timeZoneId: "Asia/Almaty", label: "Almaty", countryCode: "KZ" },
  Moscow: { timeZoneId: "Europe/Moscow", label: "Moscow", countryCode: "RU" },
  Kolkata: { timeZoneId: "Asia/Kolkata", label: "Kolkata", countryCode: "IN" },
  Kathmandu: {
    timeZoneId: "Asia/Kathmandu",
    label: "Kathmandu",
    countryCode: "NP",
  },
  Tokyo: { timeZoneId: "Asia/Tokyo", label: "Tokyo", countryCode: "JP" },
  "New York": {
    timeZoneId: "America/New_York",
    label: "New York",
    countryCode: "US",
  },
};

/** Turns city names into stored entries; fails on a city the table lacks. */
export function buildStoredLocations(cityNames: string[]): StoredLocation[] {
  return cityNames.map((cityName) => {
    const knownCity = KNOWN_CITIES[cityName];
    if (!knownCity) throw new Error(`Unknown city in a scenario: ${cityName}`);
    return knownCity;
  });
}

/** Splits `"Almaty", "Moscow"` into city names. */
export function parseCityNames(quotedNames: string): string[] {
  return [...quotedNames.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

export const addLocationButton = (page: Page) =>
  page.getByRole("button", { name: ADD_LOCATION_NAME });

export const queryField = (page: Page) =>
  page.getByRole("combobox", { name: SEARCH_LABEL });

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

export const removeButton = (page: Page, cityName: string) =>
  page.getByRole("button", { name: `Remove ${cityName}` });
