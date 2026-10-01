// Verifies FR7, UX1 of add-main-page-scaffold: the empty state of Cards, and
// FR10, FR12, FR17, NFR-A2, NFR-A3 of add-locations-via-search, and FR1 of
// reorder-locations-by-drag-and-drop.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider } from "@/controller";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
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
      <CardsView />
    </LocationsProvider>,
  );

const savedLocations = (...labels: string[]) => ({
  initialDocument: {
    status: LocationsLoadStatus.LOADED as const,
    locations: labels.map((label) =>
      buildLocation({ label, timeZoneId: `Test/${label}`, countryCode: "RU" }),
    ),
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
    { language: "ru", explanation: "Локации пока не добавлены." },
  ])(
    "should explain in $language that no locations are added",
    async ({ language, explanation }) => {
      await i18n.changeLanguage(language);
      renderCards();
      expect(screen.getByText(explanation)).toBeInTheDocument();
    },
  );

  it("should offer the Add location action in the empty state", () => {
    renderCards();
    expect(screen.getByRole("button")).toHaveTextContent("Add location");
  });

  it("should list the saved locations and keep the action", () => {
    renderCards(savedLocations("Alpha", "Beta"));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(
      screen.queryByText("No locations added yet."),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add location" })).toBeVisible();
  });

  it("should show only the load error with Reset for an unreadable list", () => {
    renderCards({
      initialDocument: { status: LocationsLoadStatus.UNREADABLE },
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.queryByText("No locations added yet."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add location" }),
    ).not.toBeInTheDocument();
  });

  it("should show the empty state after Reset", async () => {
    renderCards({
      initialDocument: { status: LocationsLoadStatus.UNREADABLE },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "Reset the list" }),
    );
    expect(screen.getByText("No locations added yet.")).toBeInTheDocument();
  });

  it("should keep the same Add location button when the first location is added", async () => {
    renderCards();
    const buttonBefore = screen.getByRole("button", { name: "Add location" });
    await userEvent.click(buttonBefore);
    await userEvent.type(await screen.findByRole("combobox"), "Moscow");
    await userEvent.click(screen.getByRole("option", { name: /Moscow/ }));
    expect(screen.getByRole("button", { name: "Add location" })).toBe(
      buttonBefore,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("should announce an added location politely", async () => {
    renderCards();
    await userEvent.click(screen.getByRole("button", { name: "Add location" }));
    await userEvent.type(await screen.findByRole("combobox"), "Moscow");
    await userEvent.click(screen.getByRole("option", { name: /Moscow/ }));
    expect(screen.getByText("Moscow added")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("should announce a removed location politely", async () => {
    renderCards(savedLocations("Alpha", "Beta"));
    await userEvent.click(screen.getByRole("button", { name: "Remove Alpha" }));
    expect(screen.getByText("Alpha removed")).toHaveAttribute(
      "aria-live",
      "polite",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("should focus Add location after the last location is removed", async () => {
    renderCards(savedLocations("Alpha"));
    await userEvent.click(screen.getByRole("button", { name: "Remove Alpha" }));
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
