// Verifies FR1, FR2, FR3, FR4 of fix-day-track-handle-overlap-and-end-of-day.
import { act, cleanup, screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect, vi } from "vitest";
import { createLocalStorageLocationRepository } from "@/adapters";
import {
  NANOSECONDS_PER_MINUTE,
  STORAGE_KEYS,
  TRACK_END_BEFORE_DAY_END_MINUTES,
} from "@/constants";
import { Temporal } from "@/lib/temporal";
import { createDateSelectionWorld } from "../../date_selection/steps/dateSelectionWorld";
import { cityEntry } from "../../locations/steps/locationsUiWorld";

const SCHEMA_VERSION_BEFORE_HOME = 1;
const SCHEMA_VERSION_WITH_HOME = 2;
const GAP_NOTE_SELECTOR = "p.text-xs";
const CITY_SEPARATOR = ", ";
const MENU_ITEM_SEPARATOR = ", ";

/**
 * Per-scenario state and step handlers of the home location features, on top
 * of the date selection world (cards, date bar, switchable clock).
 * Implements FR1-FR11 of set-home-location-and-show-differences (D1-D8).
 */
export function createHomeLocationWorld() {
  const world = createDateSelectionWorld();
  const storageRepository = () =>
    createLocalStorageLocationRepository({
      getStorage: () => localStorage,
      createChannel: () => undefined,
    });
  const idOf = (city: string) => `${cityEntry(city).timeZoneId}|${city}`;
  const entriesOf = (cities: string) =>
    cities.split(CITY_SEPARATOR).map(cityEntry);
  const rowTexts = () => world.getLocations().rows.map((row) => row.cityLabel);
  const menuButtonOf = (city: string) =>
    within(world.rowOf(city)).getByRole("button", {
      name: i18n.t("locations.locationMenu", { city }),
    });
  const homeMarkOf = (city: string) =>
    within(world.rowOf(city)).queryByRole("img", {
      name: i18n.t("locations.homeMarkLabel"),
    });
  const chooseMenuItem = async (menuButton: HTMLElement, itemKey: string) => {
    await userEvent.click(menuButton);
    await userEvent.click(
      screen.getByRole("menuitem", { name: i18n.t(itemKey) }),
    );
  };
  const writeStorage = (payload: unknown, schemaVersion: number) => {
    localStorage.setItem(
      STORAGE_KEYS.LOCATIONS,
      JSON.stringify({ schemaVersion, payload }),
    );
    world.useRepository(storageRepository());
  };

  const noteOfBar = () =>
    world.barElement().querySelector(GAP_NOTE_SELECTOR)?.textContent;

  const steps = {
    givenZone: (_ctx: unknown, zone: string) => world.setDeviceZone(zone),
    givenInstant: (_ctx: unknown, timestamp: string) =>
      world.setInstant(timestamp),
    givenList: (_ctx: unknown, cities: string) => world.setStoredCities(cities),
    givenHome: (_ctx: unknown, city: string) => world.setStoredHome(city),
    givenOpen: () => world.openApp(),
    whenMakesHome: (_ctx: unknown, city: string) =>
      chooseMenuItem(menuButtonOf(city), "locations.makeHome"),
    thenIsHome: (_ctx: unknown, city: string) =>
      expect(homeMarkOf(city)).not.toBeNull(),
    thenIsNotHome: (_ctx: unknown, city: string) =>
      expect(homeMarkOf(city)).toBeNull(),
    thenNoHome: () =>
      expect(
        screen.queryByRole("img", { name: i18n.t("locations.homeMarkLabel") }),
      ).toBeNull(),
    thenList: (_ctx: unknown, cities: string) =>
      expect(rowTexts().join(CITY_SEPARATOR)).toBe(cities),
    whenOpensMenu: (_ctx: unknown, city: string) =>
      userEvent.click(menuButtonOf(city)),
    thenMenuOffers: (_ctx: unknown, items: string) =>
      expect(
        screen.getAllByRole("menuitem").map((item) => item.textContent),
      ).toEqual(items.split(MENU_ITEM_SEPARATOR)),
    whenMovedToNextDay: () => world.showNextDay(),
    thenNoNote: () => expect(noteOfBar()).toBeUndefined(),
    /** Every row shows the wall time and date of the instant in its own zone. */
    thenPinned: (_ctx: unknown, timestamp: string) => {
      expect(world.getReference().dateBar.isPinned).toBe(true);
      for (const row of world.getLocations().rows) {
        const zoned = Temporal.Instant.from(timestamp).toZonedDateTimeISO(
          cityEntry(row.cityLabel).timeZoneId,
        );
        expect(row.localIsoDate).toBe(zoned.toPlainDate().toString());
        expect(row.localTimeLabel).toBe(
          zoned.toPlainTime().toString({ smallestUnit: "minute" }),
        );
      }
    },
    /** The track of every card, read back as the day it spans. */
    thenTrackDay: (_ctx: unknown, start: string, end: string) => {
      for (const row of world.getLocations().rows) {
        const track = row.dayTrack;
        if (track === undefined)
          throw new Error(`no track for ${row.cityLabel}`);
        const dayMinutes = track.maxMinutes + TRACK_END_BEFORE_DAY_END_MINUTES;
        const dayStart = world
          .clock()
          .instant()
          .subtract({
            nanoseconds: Math.round(
              track.fraction * dayMinutes * NANOSECONDS_PER_MINUTE,
            ),
          })
          .round({ smallestUnit: "minute" });
        expect([
          dayStart.toString(),
          dayStart.add({ minutes: dayMinutes }).toString(),
        ]).toEqual([start, end]);
      }
    },
    spyOnWrites: () => vi.spyOn(localStorage, "setItem"),
  };

  return {
    world,
    steps,
    idOf,
    reset: async () => {
      localStorage.clear();
      await world.reset();
    },
    homeMarkOf,
    rowTexts,
    makeHome: (city: string) =>
      chooseMenuItem(menuButtonOf(city), "locations.makeHome"),
    removeCity: (city: string) =>
      chooseMenuItem(menuButtonOf(city), "locations.remove"),
    clearHome: () => {
      const homeRow = screen
        .getByRole("img", { name: i18n.t("locations.homeMarkLabel") })
        .closest("li") as HTMLElement;
      return chooseMenuItem(
        within(homeRow).getByRole("button", { expanded: false }),
        "locations.clearHome",
      );
    },
    openMenuOf: (city: string) => userEvent.click(menuButtonOf(city)),
    menuItems: () =>
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    expectNoHomeMark: () =>
      expect(
        screen.queryByRole("img", { name: i18n.t("locations.homeMarkLabel") }),
      ).toBeNull(),
    noteOfBar,
    seedVersion1List: (cities: string) =>
      writeStorage(
        { locations: entriesOf(cities) },
        SCHEMA_VERSION_BEFORE_HOME,
      ),
    seedList: (cities: string, homeCity?: string) =>
      writeStorage(
        {
          locations: entriesOf(cities),
          homeLocationId: homeCity === undefined ? null : idOf(homeCity),
        },
        SCHEMA_VERSION_WITH_HOME,
      ),
    reopenApp: async () => {
      act(() => world.getWriteScheduler().runPending());
      cleanup();
      world.useRepository(storageRepository());
      await world.openApp();
    },
    storedDocument: () => localStorage.getItem(STORAGE_KEYS.LOCATIONS),
  };
}
