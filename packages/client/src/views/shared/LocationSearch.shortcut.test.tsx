// Verifies FR1, NFR-P1 of open-location-search-with-slash-shortcut
import zoneCities from "virtual:zone-cities";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  createCompositeCitySearch,
  createInMemoryLocationRepository,
} from "@/adapters";
import { LocationsProvider } from "@/controller";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationSearch } from "./LocationSearch";

const renderSearch = () => {
  const loadCitySearch = vi.fn(async () =>
    createCompositeCitySearch(zoneCities),
  );
  render(
    <LocationsProvider
      repository={createInMemoryLocationRepository()}
      writeScheduler={immediateWriteScheduler}
    >
      <LocationSearch loadCitySearch={loadCitySearch} />
    </LocationsProvider>,
  );
  return loadCitySearch;
};

describe("LocationSearch slash shortcut", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should open the search with suggestions when / is pressed", async () => {
    renderSearch();
    await userEvent.keyboard("/");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(await screen.findByText("Popular locations")).toBeInTheDocument();
  });

  it("should load the search data only once / opens the search", async () => {
    const loadCitySearch = renderSearch();
    expect(loadCitySearch).not.toHaveBeenCalled();
    await userEvent.keyboard("/");
    await screen.findByRole("dialog");
    expect(loadCitySearch).toHaveBeenCalledTimes(1);
  });
});
