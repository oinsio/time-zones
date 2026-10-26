import { expect } from "@playwright/test";
import {
  openCalendarWithMouse,
  showNextDay,
} from "../../date_selection/steps/dateSelectionE2eHelpers";
import { englishLocale } from "../../main_page/steps/englishTexts";
import {
  selectTrackFraction,
  timeTextOf,
} from "../../time_selection/steps/timeSelectionE2eHelpers";
import type { LocationsWorld } from "./locations_ui_e2e.fixtures";
import {
  buildStoredLocations,
  NO_RESULTS_TEXT,
  openSearch,
  resultOption,
  SEARCH_LOAD_ERROR_TEXT,
  SEARCH_LOADING_TEXT,
  SUGGESTIONS_HEADING,
  typeQuery,
  UNREADABLE_DOCUMENT_TEXT,
} from "./locationsE2eHelpers";

const STORAGE_WARNING_TEXT = englishLocale.mainPage.storageUnavailable;
const RESULTS_QUERY = "Mos";
const NO_MATCHES_QUERY = "qqqq";
const ABBREVIATION_QUERY = "IST";
const LIST_CITY_NAMES = ["Almaty", "Moscow"];
const TIME_SELECTED_CITY = "Almaty";
const TIME_SELECTED_PERCENT = 75;
const TIME_SELECTED_LABEL = "18:00";

/** The UI states of the locations screen that have a screen of their own. */
export enum LocationsState {
  LIST = "list",
  EMPTY = "empty",
  UNREADABLE = "unreadable",
  STORAGE_UNAVAILABLE = "storage unavailable",
  SEARCH_LOADING = "search loading",
  SEARCH_ERROR = "search error",
  SUGGESTIONS = "suggestions",
  RESULTS = "results",
  NO_MATCHES = "no matches",
  IST_RESULTS = "IST results",
  PINNED = "pinned",
  CALENDAR = "calendar",
  TIME_SELECTED = "time-selected",
}

/**
 * Brings the open app into one state. States that need seeded storage reload
 * the page, because the seed runs before the app starts; the search data
 * routes are set on the page that stays, which the service worker does not
 * control yet (D8).
 * Implements NFR-A1, UX1, FR12, FR13, FR15 of add-locations-via-search and
 * NFR-R3 of select-date-with-calendar-and-now (pinned and calendar states).
 */
export async function enterLocationsState(
  world: LocationsWorld,
  state: LocationsState,
) {
  const { page } = world;
  switch (state) {
    case LocationsState.LIST:
      await world.seedList(buildStoredLocations(LIST_CITY_NAMES));
      await world.reloadIfOpen();
      await expect(page.getByRole("listitem")).toHaveCount(2);
      break;
    case LocationsState.EMPTY:
      await expect(
        page.getByText(englishLocale.views.cardsEmptyState),
      ).toBeVisible();
      break;
    case LocationsState.UNREADABLE:
      await world.seedDocument(UNREADABLE_DOCUMENT_TEXT);
      await world.reloadIfOpen();
      await expect(page.getByRole("alert")).toBeVisible();
      break;
    case LocationsState.STORAGE_UNAVAILABLE:
      await world.failAllStorageWrites();
      await world.reloadIfOpen();
      await expect(page.getByText(STORAGE_WARNING_TEXT)).toBeVisible();
      break;
    case LocationsState.SEARCH_LOADING:
      await world.holdSearchData();
      await openSearch(page);
      await expect(page.getByText(SEARCH_LOADING_TEXT)).toBeVisible();
      break;
    case LocationsState.SEARCH_ERROR:
      await world.failSearchData();
      await openSearch(page);
      await expect(page.getByText(SEARCH_LOAD_ERROR_TEXT)).toBeVisible();
      break;
    case LocationsState.SUGGESTIONS:
      await openSearch(page);
      await expect(page.getByText(SUGGESTIONS_HEADING)).toBeVisible();
      break;
    case LocationsState.RESULTS:
      await openSearch(page);
      await typeQuery(page, RESULTS_QUERY);
      await expect(resultOption(page, "Moscow")).toBeVisible();
      break;
    case LocationsState.NO_MATCHES:
      await openSearch(page);
      await typeQuery(page, NO_MATCHES_QUERY);
      await expect(page.getByText(NO_RESULTS_TEXT)).toBeVisible();
      break;
    case LocationsState.IST_RESULTS:
      await openSearch(page);
      await typeQuery(page, ABBREVIATION_QUERY);
      await expect(resultOption(page, "Kolkata")).toBeVisible();
      break;
    case LocationsState.TIME_SELECTED:
      await world.seedList(buildStoredLocations(LIST_CITY_NAMES));
      await world.reloadIfOpen();
      await expect(page.getByRole("listitem")).toHaveCount(
        LIST_CITY_NAMES.length,
      );
      await selectTrackFraction(
        page,
        TIME_SELECTED_CITY,
        TIME_SELECTED_PERCENT,
      );
      await expect(timeTextOf(page, TIME_SELECTED_CITY)).toHaveText(
        TIME_SELECTED_LABEL,
      );
      break;
    case LocationsState.PINNED:
    case LocationsState.CALENDAR:
      await world.seedList(buildStoredLocations(LIST_CITY_NAMES));
      await world.reloadIfOpen();
      await expect(page.getByRole("listitem")).toHaveCount(
        LIST_CITY_NAMES.length,
      );
      await showNextDay(page);
      if (state === LocationsState.CALENDAR) await openCalendarWithMouse(page);
      break;
  }
}
