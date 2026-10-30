// Verifies FR7, UX1 of add-main-page-scaffold: the empty state of Cards, and
// FR10, FR12, FR17, NFR-A2, NFR-A3 of add-locations-via-search, and FR1 of
// reorder-locations-by-drag-and-drop.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createInMemoryLocationRepository } from "@/adapters";
import { ADD_LOCATION_BUTTON_ID } from "@/constants";
import { LocationsProvider } from "@/controller";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { removeLocationThroughMenu } from "@/test/removeLocationThroughMenu";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import CardsView from "./CardsView";

type RepositoryOptions = Parameters<typeof createInMemoryLocationRepository>[0];

const renderCards = (options: RepositoryOptions = {}) =>
  render(
    <LocationsProvider
      repository={createInMemoryLocationRepository(options)}
      writeScheduler={immediateWriteScheduler}
    >
      <button type="button" id={ADD_LOCATION_BUTTON_ID}>
        Add location
      </button>
      <CardsView />
    </LocationsProvider>,
  );

const savedLocations = (...labels: string[]) => ({
  initialDocument: {
    status: LocationsLoadStatus.LOADED as const,
    locations: labels.map((label) =>
      buildLocation({ label, timeZoneId: `Test/${label}`, countryCode: "RU" }),
    ),
    homeLocationId: null,
  },
});

describe("CardsView", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    stubZoneCitiesFetch();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    { language: "en", explanation: "No locations added yet." },
    { language: "ru", explanation: "Места пока не добавлены." },
  ])(
    "should explain in $language that no locations are added",
    async ({ language, explanation }) => {
      await i18n.changeLanguage(language);
      renderCards(savedLocations());
      expect(screen.getByText(explanation)).toBeInTheDocument();
    },
  );

  it("should list the saved locations without the empty state", () => {
    renderCards(savedLocations("Alpha", "Beta"));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(
      screen.queryByText("No locations added yet."),
    ).not.toBeInTheDocument();
  });

  it("should show only the load error with Reset for an unreadable list", () => {
    renderCards({
      initialDocument: { status: LocationsLoadStatus.UNREADABLE },
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.queryByText("No locations added yet."),
    ).not.toBeInTheDocument();
  });

  it("should show the first-launch list, not the empty state, after Reset", async () => {
    renderCards({
      initialDocument: { status: LocationsLoadStatus.UNREADABLE },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "Reset the list" }),
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.queryByText("No locations added yet."),
    ).not.toBeInTheDocument();
  });

  it("should announce a removed location politely", async () => {
    renderCards(savedLocations("Alpha", "Beta"));
    await removeLocationThroughMenu("Alpha");
    expect(screen.getByText("Alpha removed")).toHaveAttribute(
      "aria-live",
      "polite",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("should focus Add location after the last location is removed", async () => {
    renderCards(savedLocations("Alpha"));
    await removeLocationThroughMenu("Alpha");
    expect(screen.getByRole("button", { name: "Add location" })).toHaveFocus();
  });

  it("should render move handles when two locations are stored", () => {
    renderCards(savedLocations("Moscow", "Almaty"));
    expect(
      screen.getByRole("button", { name: "Move Moscow" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Move Almaty" }),
    ).toBeInTheDocument();
  });
});
