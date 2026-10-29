// Implements FR1, FR7, FR8 of show-here-entry-for-device-time: seeding helpers of the locations states.
import { expect } from "@playwright/test";
import type { LocationsWorld } from "./locations_ui_e2e.fixtures";
import { buildStoredLocations } from "./locationsE2eHelpers";

const HERE_ENTRY_CITY_NAMES = ["Moscow", "Kolkata", "New York"];
const HERE_ENTRY_HOME_CITY_NAME = "Moscow";
/** The E2E device time zone is Asia/Almaty (playwright.bdd.config.ts). */
const DEVICE_CITY_NAME = "Almaty";

/**
 * Stores the device's city, so no Here entry loads the search data before the
 * state holds or fails it (FR8 of show-here-entry-for-device-time). The page
 * starts without a service worker, so the data routes of the state apply.
 */
export async function storeDeviceCity(world: LocationsWorld) {
  await world.seedList(buildStoredLocations([DEVICE_CITY_NAME]));
  await world.reloadWithoutServiceWorker();
  await expect(world.page.getByRole("listitem")).toHaveCount(1);
}

/** Seeds a list with a home location and shows it. */
export async function seedHomeList(
  world: LocationsWorld,
  cityNames: string[],
  homeCityName: string,
) {
  const [homeLocation] = buildStoredLocations([homeCityName]);
  await world.seedList(buildStoredLocations(cityNames), homeLocation);
  await world.reloadIfOpen();
  await expect(world.page.getByRole("listitem")).toHaveCount(cityNames.length);
}

/** The Here entry above a list, without home or with Moscow as home. */
export async function seedHereEntryState(
  world: LocationsWorld,
  isTravelling: boolean,
) {
  if (isTravelling) {
    await seedHomeList(world, HERE_ENTRY_CITY_NAMES, HERE_ENTRY_HOME_CITY_NAME);
    return;
  }
  await world.seedList(buildStoredLocations(HERE_ENTRY_CITY_NAMES));
  await world.reloadIfOpen();
  await expect(world.page.getByRole("listitem")).toHaveCount(
    HERE_ENTRY_CITY_NAMES.length,
  );
}
