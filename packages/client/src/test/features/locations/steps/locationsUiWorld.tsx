import { cleanup, render, screen, waitFor } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createElement } from "react";
import { expect, vi } from "vitest";
import { AppShell } from "@/app";
import { LOCATIONS_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
import { KNOWN_CITIES } from "@/test/factories/buildLocation";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";

export const NOT_JSON = "{not json";

export const cityEntry = (label: string) => ({
  label,
  timeZoneId: KNOWN_CITIES[label]?.timeZoneId ?? "",
  countryCode: KNOWN_CITIES[label]?.countryCode ?? "",
});

export const seedStoredList = (labels: string[]) =>
  localStorage.setItem(
    STORAGE_KEYS.LOCATIONS,
    JSON.stringify({
      schemaVersion: LOCATIONS_SCHEMA_VERSION,
      payload: { locations: labels.map(cityEntry) },
    }),
  );

/** Renders the real app over the stubbed search data. */
export const openApp = async () => {
  stubZoneCitiesFetch();
  render(createElement(AppShell));
  await waitFor(() =>
    expect(screen.getByRole("main").querySelector("[aria-busy]")).toBeNull(),
  );
};

export const closeApp = () => {
  cleanup();
  localStorage.clear();
};

export const openSearch = async () => {
  await userEvent.click(
    screen.getByRole("button", { name: i18n.t("locations.addLocation") }),
  );
  await screen.findByText(i18n.t("locations.suggestionsHeading"));
};

export const typeInSearch = async (query: string) => {
  if (screen.queryByRole("combobox") === null) await openSearch();
  await userEvent.type(screen.getByRole("combobox"), query);
};

export const chooseCity = async (label: string) =>
  userEvent.click(screen.getByRole("option", { name: new RegExp(label) }));

export const listedCityLabels = () =>
  screen.queryAllByRole("listitem").map((item) => item.textContent ?? "");

export const searchAndChoose = async (query: string, city: string) => {
  await typeInSearch(query);
  await chooseCity(city);
};

export const expectListContains = (city: string) =>
  expect(listedCityLabels()).toEqual([expect.stringContaining(city)]);

export const expectEmptyState = () => {
  expect(screen.getByText(i18n.t("views.cardsEmptyState"))).toBeVisible();
  expect(
    screen.getByRole("button", { name: i18n.t("locations.addLocation") }),
  ).toBeVisible();
};

export const expectSuggestions = () => {
  expect(
    screen.getByText(i18n.t("locations.suggestionsHeading")),
  ).toBeVisible();
  expect(screen.getAllByRole("option").length).toBeGreaterThan(0);
};

/** Makes `localStorage.setItem` throw for the keys `shouldFail` accepts. */
export const failStorageWrites = (shouldFail: (key: string) => boolean) => {
  const writeItem = localStorage.setItem.bind(localStorage);
  vi.spyOn(localStorage, "setItem").mockImplementation((key, value) => {
    if (shouldFail(key)) {
      throw new DOMException("quota", "QuotaExceededError");
    }
    writeItem(key, value);
  });
};

export const removeCity = (city: string) =>
  userEvent.click(
    screen.getByRole("button", {
      name: i18n.t("locations.removeLocation", { city }),
    }),
  );

export const storageWarningText = () => i18n.t("mainPage.storageUnavailable");
