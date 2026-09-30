// Verifies FR6, FR8, FR15, NFR-P2 of add-locations-via-search.
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import zoneCities from "virtual:zone-cities";
import {
  createCompositeCitySearch,
  createInMemoryLocationRepository,
} from "@/adapters";
import { LocationsProvider, useLocations } from "@/controller";
import type { CitySearch, LoadCitySearch } from "@/ports";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationSearch } from "./LocationSearch";

function LocationNames() {
  const { rows } = useLocations();
  return <p data-testid="names">{rows.map((row) => row.cityLabel).join(",")}</p>;
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
    expect(screen.getByText("Loading the search…")).toBeInTheDocument();
    await act(async () => finishLoading());
    expect(await screen.findByText("Popular locations")).toBeInTheDocument();
    expect(loadCitySearch).toHaveBeenCalledTimes(1);
  });

  it("should show Moscow when Mos is typed", async () => {
    renderSearch();
    await openSearch();
    await screen.findByText("Popular locations");
    await userEvent.type(screen.getByRole("combobox"), "Mos");
    expect(
      screen.getByRole("option", { name: /Moscow/ }),
    ).toBeInTheDocument();
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

  it("should call onAdded with the city name after adding", async () => {
    const onAdded = vi.fn();
    render(
      <LocationsProvider
        repository={createInMemoryLocationRepository()}
        writeScheduler={immediateWriteScheduler}
      >
        <LocationSearch
          loadCitySearch={async () => createCompositeCitySearch(zoneCities)}
          onAdded={onAdded}
        />
      </LocationsProvider>,
    );
    await openSearch();
    await screen.findByText("Popular locations");
    await userEvent.type(screen.getByRole("combobox"), "Mos");
    await userEvent.click(screen.getByRole("option", { name: /Moscow/ }));
    expect(onAdded).toHaveBeenCalledWith("Moscow");
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
