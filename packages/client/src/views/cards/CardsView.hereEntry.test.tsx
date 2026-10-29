// Verifies FR1, FR7, FR8, FR9, UX2 of show-here-entry-for-device-time (D5, D6).
import zoneCities from "virtual:zone-cities";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  createCompositeCitySearch,
  createInMemoryLocationRepository,
} from "@/adapters";
import { LocationsProvider } from "@/controller";
import { type LoadCitySearch, LocationsLoadStatus } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { removeLocationThroughMenu } from "@/test/removeLocationThroughMenu";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import CardsView from "./CardsView";

// The unit test device zone is Pacific/Kiritimati (src/test/deviceTimeZone.ts)
const HERE_ENTRY_NAME = "Kiritimati, You are here, Device time";

const createLoader = (): LoadCitySearch =>
  vi.fn(async () => createCompositeCitySearch(zoneCities));

const renderCards = (
  initialDocument: Parameters<typeof createInMemoryLocationRepository>[0] = {},
  loadCitySearch: LoadCitySearch = createLoader(),
) =>
  render(
    <LocationsProvider
      repository={createInMemoryLocationRepository(initialDocument)}
      writeScheduler={immediateWriteScheduler}
      loadCitySearch={loadCitySearch}
    >
      <CardsView />
    </LocationsProvider>,
  );

const savedAlpha = {
  initialDocument: {
    status: LocationsLoadStatus.LOADED as const,
    locations: [
      buildLocation({
        label: "Alpha",
        timeZoneId: "Test/Alpha",
        countryCode: "RU",
      }),
    ],
    homeLocationId: null,
  },
};

describe("CardsView Here entry", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });
  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it("should show the Here entry first, outside the numbered list", () => {
    renderCards(savedAlpha);

    const hereEntry = screen.getByRole("region", { name: HERE_ENTRY_NAME });
    const list = screen.getByRole("list");

    expect(list).not.toContainElement(hereEntry);
    expect(
      hereEntry.compareDocumentPosition(list) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
  });

  it("should show the Here entry, the explanation and Add location in order in the empty state", () => {
    renderCards();

    const hereEntry = screen.getByRole("region", { name: HERE_ENTRY_NAME });
    const explanation = screen.getByText("No locations added yet.");
    const addButton = screen.getByRole("button", { name: "Add location" });

    expect(
      hereEntry.compareDocumentPosition(explanation) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      explanation.compareDocumentPosition(addButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("should show no Here entry and load nothing on the load error", () => {
    const loader = createLoader();

    renderCards(
      { initialDocument: { status: LocationsLoadStatus.UNREADABLE } },
      loader,
    );

    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(loader).not.toHaveBeenCalled();
  });

  it("should request the city data once for the Here entry and the open search", async () => {
    const loader = createLoader();
    renderCards({}, loader);
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole("button", { name: "Add location" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("should focus Add location after the last location is removed", async () => {
    renderCards(savedAlpha);

    await removeLocationThroughMenu("Alpha");

    expect(screen.getByRole("button", { name: "Add location" })).toHaveFocus();
  });
});
