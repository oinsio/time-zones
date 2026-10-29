// Implements FR1, FR4, FR5 of show-here-entry-for-device-time: rendered-page queries of the Here entry features.
import { screen, within } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { cityEntry } from "./locationsUiWorld";

/** The part of the Here entry's name that no city or mark changes. */
const deviceTimeName = () =>
  i18n.t("locations.hereEntryName").split(", ").at(-1);

export const findHereEntries = () =>
  screen
    .queryAllByRole("region")
    .filter((region) =>
      (region.getAttribute("aria-label") ?? "").endsWith(
        deviceTimeName() ?? "",
      ),
    );

export const getHereEntry = () => {
  const [entry] = findHereEntries();
  expect(entry, "the Here entry").toBeDefined();
  return entry;
};

export const getCardOf = (city: string) =>
  screen
    .getByRole("button", { name: i18n.t("locations.locationMenu", { city }) })
    .closest("li") as HTMLElement;

export const getHereSlider = () => within(getHereEntry()).getByRole("slider");

/** The stored document a scenario starts with. */
export const buildStoredDocument = (stored: {
  isListUnreadable: boolean;
  hasStoredList: boolean;
  cities: string[];
  homeCity: string | undefined;
}) => {
  if (stored.isListUnreadable)
    return { status: LocationsLoadStatus.UNREADABLE } as const;
  if (!stored.hasStoredList)
    return { status: LocationsLoadStatus.EMPTY } as const;
  return {
    status: LocationsLoadStatus.LOADED,
    locations: stored.cities.map((city) => buildLocation(cityEntry(city))),
    homeLocationId:
      stored.homeCity === undefined
        ? null
        : buildLocation(cityEntry(stored.homeCity)).id,
  } as const;
};
