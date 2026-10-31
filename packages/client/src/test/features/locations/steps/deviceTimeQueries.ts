// Implements FR8, FR12 of add-settings-page-and-device-time-location: rendered-page queries of the device time features.
import { screen, within } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import { buildDeviceTimeLocation } from "@/model";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { cityEntry } from "./locationsUiWorld";

/** The list token that stands for the device time location in a scenario's list. */
export const DEVICE_TIME_LIST_TOKEN = "the device time location";

/** The part of the device time location's name that no city or mark changes. */
const deviceTimeName = () =>
  i18n.t("locations.deviceTimeName").split(", ").at(-1);

export const findDeviceTimeRows = () =>
  screen
    .queryAllByRole("listitem")
    .filter((region) =>
      (region.getAttribute("aria-label") ?? "").endsWith(
        deviceTimeName() ?? "",
      ),
    );

export const getDeviceTimeRow = () => {
  const [row] = findDeviceTimeRows();
  expect(row, "the device time location").toBeDefined();
  return row;
};

export const getCardOf = (city: string) =>
  screen
    .getByRole("button", { name: i18n.t("locations.locationMenu", { city }) })
    .closest("li") as HTMLElement;

export const getDeviceTimeSlider = () =>
  within(getDeviceTimeRow()).getByRole("slider");

const buildStoredLocation = (name: string, deviceZone: string) =>
  name === DEVICE_TIME_LIST_TOKEN
    ? buildDeviceTimeLocation(deviceZone)
    : buildLocation(cityEntry(name));

/** The stored document a scenario starts with. */
export const buildStoredDocument = (stored: {
  isListUnreadable: boolean;
  hasStoredList: boolean;
  cities: string[];
  homeCity: string | undefined;
  deviceZone: string;
}) => {
  if (stored.isListUnreadable)
    return { status: LocationsLoadStatus.UNREADABLE } as const;
  if (!stored.hasStoredList)
    return { status: LocationsLoadStatus.EMPTY } as const;
  const build = (name: string) => buildStoredLocation(name, stored.deviceZone);
  return {
    status: LocationsLoadStatus.LOADED,
    locations: stored.cities.map(build),
    homeLocationId:
      stored.homeCity === undefined ? null : build(stored.homeCity).id,
  } as const;
};
