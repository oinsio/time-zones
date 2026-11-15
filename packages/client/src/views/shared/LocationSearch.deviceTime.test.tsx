// Verifies FR11 of add-settings-page-and-device-time-location (D12).
// Verifies FR6, FR8, FR15, NFR-P2 of add-locations-via-search.

import zoneCities from "virtual:zone-cities";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  createCompositeCitySearch,
  createInMemoryLocationRepository,
} from "@/adapters";
import { LocationsProvider, useLocations } from "@/controller";
import type { CitySearch, LoadCitySearch } from "@/ports";
import { storedEmptyList } from "@/test/renderLocations";
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

describe("LocationSearch device time option", () => {
  const renderWithEmptyList = (loadCitySearch?: LoadCitySearch) =>
    render(
      <LocationsProvider
        repository={createInMemoryLocationRepository({
          initialDocument: storedEmptyList,
        })}
        writeScheduler={immediateWriteScheduler}
      >
        <LocationSearch
          loadCitySearch={
            loadCitySearch ??
            (async () => createCompositeCitySearch(zoneCities))
          }
        />
        <LocationNames />
      </LocationsProvider>,
    );

  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should offer Device time as the first option", async () => {
    renderWithEmptyList();
    await openSearch();
    await screen.findByText("Popular locations");
    expect(screen.getAllByRole("option")[0]).toHaveTextContent("Device time");
  });

  it("should offer it while the search data is loading", async () => {
    renderWithEmptyList(() => new Promise<CitySearch>(() => undefined));
    await openSearch();
    expect(screen.getByRole("option", { name: "Device time" })).toBeVisible();
    expect(screen.getByText("Loading the search…")).toBeInTheDocument();
  });

  it("should offer it after the search data failed to load", async () => {
    renderWithEmptyList(() => Promise.reject(new Error("offline")));
    await openSearch();
    expect(
      await screen.findByRole("option", { name: "Device time" }),
    ).toBeVisible();
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("should match a Russian word typed while the interface is English", async () => {
    renderWithEmptyList();
    await openSearch();
    await screen.findByText("Popular locations");
    await userEvent.type(screen.getByRole("combobox"), "устр");
    expect(
      screen.getByRole("option", { name: "Device time" }),
    ).toBeInTheDocument();
  });

  it("should not offer it for a city query", async () => {
    renderWithEmptyList();
    await openSearch();
    await screen.findByText("Popular locations");
    await userEvent.type(screen.getByRole("combobox"), "Moscow");
    expect(
      screen.queryByRole("option", { name: "Device time" }),
    ).not.toBeInTheDocument();
  });

  it("should not offer it while the list holds it", async () => {
    renderSearch();
    await openSearch();
    await screen.findByText("Popular locations");
    expect(
      screen.queryByRole("option", { name: "Device time" }),
    ).not.toBeInTheDocument();
  });

  it("should add it, close the search and announce it", async () => {
    renderWithEmptyList();
    await openSearch();
    await screen.findByText("Popular locations");
    await userEvent.click(screen.getByRole("option", { name: "Device time" }));
    expect(screen.getByTestId("names")).not.toBeEmptyDOMElement();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Device time added")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("should add it with the keyboard", async () => {
    renderWithEmptyList();
    await openSearch();
    await screen.findByText("Popular locations");
    await userEvent.keyboard("{Enter}");
    expect(screen.getByTestId("names")).not.toBeEmptyDOMElement();
  });
});
