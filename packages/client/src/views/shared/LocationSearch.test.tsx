// Verifies FR6, FR8, FR15, NFR-P2 of add-locations-via-search.

import zoneCities from "virtual:zone-cities";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  createCompositeCitySearch,
  createInMemoryLocationRepository,
} from "@/adapters";
import { LocationsProvider, useLocations } from "@/controller";
import type { CitySearch, LoadCitySearch } from "@/ports";
import { fullCityData, fullZoneCities } from "@/test/fullCityData";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationSearch } from "./LocationSearch";

function LocationCoordinates() {
  const { locations } = useLocations();
  return (
    <p data-testid="coordinates">
      {JSON.stringify(
        locations.map((location) => location.coordinates ?? null),
      )}
    </p>
  );
}

function LocationNames() {
  const { rows } = useLocations();
  return (
    <p data-testid="names">{rows.map((row) => row.cityLabel).join(",")}</p>
  );
}

const renderSearch = (
  loadCitySearch: LoadCitySearch = vi.fn(async () =>
    createCompositeCitySearch(zoneCities),
  ),
) => {
  render(
    <LocationsProvider
      repository={createInMemoryLocationRepository()}
      writeScheduler={immediateWriteScheduler}
    >
      <LocationSearch loadCitySearch={loadCitySearch} />
      <LocationNames />
      <LocationCoordinates />
    </LocationsProvider>,
  );
  return loadCitySearch;
};

const openSearch = () =>
  userEvent.click(screen.getByRole("button", { name: "Add location" }));

describe("LocationSearch", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should not load the search data while the search is closed", () => {
    const loadCitySearch = vi.fn();
    renderSearch(loadCitySearch);
    expect(loadCitySearch).not.toHaveBeenCalled();
  });

  it("should show the loading placeholder, then suggestions, when opened", async () => {
    let finishLoading: () => void = () => undefined;
    const loadCitySearch = vi.fn(
      () =>
        new Promise<CitySearch>((resolve) => {
          finishLoading = () => resolve(createCompositeCitySearch(zoneCities));
        }),
    );
    renderSearch(loadCitySearch);
    await openSearch();
    expect(
      await screen.findByText("Loading the search…", {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    await act(async () => finishLoading());
    expect(await screen.findByText("Popular locations")).toBeInTheDocument();
    expect(loadCitySearch).toHaveBeenCalledTimes(1);
  });

  it("should show Moscow when Mos is typed", async () => {
    renderSearch();
    await openSearch();
    await screen.findByText("Popular locations");
    await userEvent.type(screen.getByRole("combobox"), "Mos");
    expect(screen.getByRole("option", { name: /Moscow/ })).toBeInTheDocument();
  });

  it("should add the chosen city and close the search", async () => {
    renderSearch();
    await openSearch();
    await screen.findByText("Popular locations");
    await userEvent.type(screen.getByRole("combobox"), "Mos");
    await userEvent.click(screen.getByRole("option", { name: /Moscow/ }));
    expect(screen.getByTestId("names")).toHaveTextContent("Moscow");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // Verifies FR6 of add-city-coordinates-to-locations (D6).
  it("should add the chosen city with the coordinates of its record", async () => {
    renderSearch(
      vi.fn(async () =>
        createCompositeCitySearch(fullZoneCities, fullCityData),
      ),
    );
    await openSearch();
    await screen.findByText("Popular locations");
    await userEvent.type(screen.getByRole("combobox"), "Kazan");
    await userEvent.click(screen.getByRole("option", { name: /Kazan/ }));
    expect(screen.getByTestId("coordinates")).toHaveTextContent(
      JSON.stringify([null, { latitude: 55.8, longitude: 49.1 }]),
    );
  });

  it("should announce the added city politely", async () => {
    renderSearch();
    await openSearch();
    await screen.findByText("Popular locations");
    await userEvent.type(screen.getByRole("combobox"), "Mos");
    await userEvent.click(screen.getByRole("option", { name: /Moscow/ }));
    expect(screen.getByText("Moscow added")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("should reset the query when the search is reopened", async () => {
    renderSearch();
    await openSearch();
    await screen.findByText("Popular locations");
    await userEvent.type(screen.getByRole("combobox"), "Mos");
    await userEvent.keyboard("{Escape}");
    await openSearch();
    expect(await screen.findByRole("combobox")).toHaveValue("");
  });
});
