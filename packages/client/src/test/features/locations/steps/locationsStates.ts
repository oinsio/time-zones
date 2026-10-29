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
  menuButton,
  NO_RESULTS_TEXT,
  openSearch,
  resultOption,
  SEARCH_LOAD_ERROR_TEXT,
  SEARCH_LOADING_TEXT,
  SUGGESTIONS_HEADING,
  typeQuery,
  UNREADABLE_DOCUMENT_TEXT,
} from "./locationsE2eHelpers";
import {
  seedHereEntryState,
  seedHomeList,
  storeDeviceCity,
} from "./locationsSeedHelpers";

const STORAGE_WARNING_TEXT = englishLocale.mainPage.storageUnavailable;
const RESULTS_QUERY = "Mos";
const NO_MATCHES_QUERY = "qqqq";
const ABBREVIATION_QUERY = "IST";
const LIST_CITY_NAMES = ["Almaty", "Moscow"];
const TIME_SELECTED_CITY = "Almaty";
const TIME_SELECTED_PERCENT = 75;
const TIME_SELECTED_LABEL = "18:00";
const HOME_CITY_NAMES = ["Almaty", "Kathmandu", "New York"];
const HOME_CITY_NAME = "Almaty";
const TRAVELLING_HOME_CITY_NAME = "Moscow";
const MENU_OPEN_CITY_NAME = "Kathmandu";

/** The UI states of the locations screen that have a screen of their own. */
export enum WorldClockState {
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
  HOME = "home",
  TRAVELLING = "travelling",
  MENU_OPEN = "menu open",
  HERE_ENTRY = "here-entry",
  HERE_ENTRY_TRAVEL = "here-entry-travel",
}

/**
 * Brings the open app into one state. States that need seeded storage reload
 * the page, because the seed runs before the app starts; the search data
 * routes are set on the page that stays, which the service worker does not
 * control yet (D8).
 * Implements NFR-A1, UX1, FR12, FR13, FR15 of add-locations-via-search and
 * NFR-R3 of select-date-with-calendar-and-now (pinned and calendar states);
 * NFR-A1, NFR-R2 of set-home-location-and-show-differences (home, travelling
 * and menu open states); FR1, FR7, NFR-A1 of show-here-entry-for-device-time
 * (here-entry and here-entry-travel states).
 */
export async function enterLocationsState(
  world: LocationsWorld,
  state: WorldClockState,
) {
  const { page } = world;
  switch (state) {
    case WorldClockState.LIST:
      await world.seedList(buildStoredLocations(LIST_CITY_NAMES));
      await world.reloadIfOpen();
      await expect(page.getByRole("listitem")).toHaveCount(2);
      break;
    case WorldClockState.EMPTY:
      await expect(
        page.getByText(englishLocale.views.cardsEmptyState),
      ).toBeVisible();
      break;
    case WorldClockState.UNREADABLE:
      await world.seedDocument(UNREADABLE_DOCUMENT_TEXT);
      await world.reloadIfOpen();
      await expect(page.getByRole("alert")).toBeVisible();
      break;
    case WorldClockState.STORAGE_UNAVAILABLE:
      await world.failAllStorageWrites();
      await world.reloadIfOpen();
      await expect(page.getByText(STORAGE_WARNING_TEXT)).toBeVisible();
      break;
    case WorldClockState.SEARCH_LOADING:
      await storeDeviceCity(world);
      await world.holdSearchData();
      await openSearch(page);
      await expect(page.getByText(SEARCH_LOADING_TEXT)).toBeVisible();
      break;
    case WorldClockState.SEARCH_ERROR:
      await storeDeviceCity(world);
      await world.failSearchData();
      await openSearch(page);
      await expect(page.getByText(SEARCH_LOAD_ERROR_TEXT)).toBeVisible();
      break;
    case WorldClockState.SUGGESTIONS:
      await openSearch(page);
      await expect(page.getByText(SUGGESTIONS_HEADING)).toBeVisible();
      break;
    case WorldClockState.RESULTS:
      await openSearch(page);
      await typeQuery(page, RESULTS_QUERY);
      await expect(resultOption(page, "Moscow")).toBeVisible();
      break;
    case WorldClockState.NO_MATCHES:
      await openSearch(page);
      await typeQuery(page, NO_MATCHES_QUERY);
      await expect(page.getByText(NO_RESULTS_TEXT)).toBeVisible();
      break;
    case WorldClockState.IST_RESULTS:
      await openSearch(page);
      await typeQuery(page, ABBREVIATION_QUERY);
      await expect(resultOption(page, "Kolkata")).toBeVisible();
      break;
    case WorldClockState.TIME_SELECTED:
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
    case WorldClockState.HOME:
    case WorldClockState.MENU_OPEN:
      await seedHomeList(world, HOME_CITY_NAMES, HOME_CITY_NAME);
      if (state === WorldClockState.MENU_OPEN) {
        await menuButton(page, MENU_OPEN_CITY_NAME).click();
        await expect(page.getByRole("menu")).toBeVisible();
      }
      break;
    case WorldClockState.HERE_ENTRY:
    case WorldClockState.HERE_ENTRY_TRAVEL:
      await seedHereEntryState(
        world,
        state === WorldClockState.HERE_ENTRY_TRAVEL,
      );
      break;
    case WorldClockState.TRAVELLING:
      await seedHomeList(world, LIST_CITY_NAMES, TRAVELLING_HOME_CITY_NAME);
      break;
    case WorldClockState.PINNED:
    case WorldClockState.CALENDAR:
      await world.seedList(buildStoredLocations(LIST_CITY_NAMES));
      await world.reloadIfOpen();
      await expect(page.getByRole("listitem")).toHaveCount(
        LIST_CITY_NAMES.length,
      );
      await showNextDay(page);
      if (state === WorldClockState.CALENDAR) await openCalendarWithMouse(page);
      break;
  }
}
