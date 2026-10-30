// Verifies FR9, FR13, UX3 of add-settings-page-and-device-time-location (D4, D11).
import zoneCities from "virtual:zone-cities";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  createCompositeCitySearch,
  createInMemoryLocationRepository,
} from "@/adapters";
import { ADD_LOCATION_BUTTON_ID } from "@/constants";
import { LocationsProvider } from "@/controller";
import { buildDeviceTimeLocation } from "@/model";
import { type LoadCitySearch, LocationsLoadStatus } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { removeLocationThroughMenu } from "@/test/removeLocationThroughMenu";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import CardsView from "./CardsView";

// The unit test device zone is Pacific/Kiritimati (src/test/deviceTimeZone.ts)
const DEVICE_ZONE_ID = "Pacific/Kiritimati";
const DEVICE_TIME_ROW_NAME = "Kiritimati, You are here, Device time";
const EMPTY_STATE_TEXT = "No locations added yet.";

const createLoader = (): LoadCitySearch =>
  vi.fn(async () => createCompositeCitySearch(zoneCities));

const renderCards = (
  initialDocument: Parameters<typeof createInMemoryLocationRepository>[0] = {},
) =>
  render(
    <LocationsProvider
      repository={createInMemoryLocationRepository(initialDocument)}
      writeScheduler={immediateWriteScheduler}
      loadCitySearch={createLoader()}
    >
      <button type="button" id={ADD_LOCATION_BUTTON_ID}>
        Add location
      </button>
      <CardsView />
    </LocationsProvider>,
  );

const storedList = (...locations: ReturnType<typeof buildLocation>[]) => ({
  initialDocument: {
    status: LocationsLoadStatus.LOADED as const,
    locations,
    homeLocationId: null,
  },
});
const alpha = buildLocation({
  label: "Alpha",
  timeZoneId: "Test/Alpha",
  countryCode: "RU",
});

describe("CardsView device time location", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });
  afterEach(async () => {
    await i18n.changeLanguage("ru");
  });

  it("should list the device time location as an item of the numbered list on the first launch", () => {
    renderCards();
    expect(
      within(screen.getByRole("list")).getByRole("listitem", {
        name: DEVICE_TIME_ROW_NAME,
      }),
    ).toBeInTheDocument();
  });

  it("should give the device time location a drag handle next to a city", () => {
    renderCards(storedList(buildDeviceTimeLocation(DEVICE_ZONE_ID), alpha));
    expect(
      screen.getByRole("button", { name: "Move Kiritimati" }),
    ).toBeInTheDocument();
  });

  it("should show no empty-state text while only the device time location is listed", () => {
    renderCards();
    expect(screen.queryByText(EMPTY_STATE_TEXT)).not.toBeInTheDocument();
  });

  it("should offer the same menu as a city card", async () => {
    renderCards();
    await userEvent.click(
      screen.getByRole("button", { name: /Actions for Kiritimati/ }),
    );
    expect(
      screen.getByRole("menuitem", { name: "Make home" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Remove" }),
    ).toBeInTheDocument();
  });

  it("should show the empty state for an empty stored list", () => {
    renderCards(storedList());
    expect(screen.getByText(EMPTY_STATE_TEXT)).toBeInTheDocument();
  });

  it("should remove the device time location and show the empty state", async () => {
    renderCards();
    await removeLocationThroughMenu("Kiritimati");
    expect(screen.getByText(EMPTY_STATE_TEXT)).toBeInTheDocument();
  });

  it("should focus the Add location button after the last removal", async () => {
    renderCards();
    await removeLocationThroughMenu("Kiritimati");
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Add location" }),
      ).toHaveFocus(),
    );
  });

  it("should make the device time location home through its menu", async () => {
    renderCards();
    await userEvent.click(
      screen.getByRole("button", { name: /Actions for Kiritimati/ }),
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "Make home" }));
    expect(
      screen.getByRole("listitem", {
        name: "Kiritimati, Home location, Device time",
      }),
    ).toBeInTheDocument();
  });
});
