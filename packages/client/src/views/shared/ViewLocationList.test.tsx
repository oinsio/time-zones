// Verifies FR8, FR9 of add-grid-meeting-range-and-share (D6, D8).
// Verifies FR7, UX1 of add-main-page-scaffold: the empty state of Cards, and
// FR10, FR12, FR17, NFR-A2, NFR-A3 of add-locations-via-search, and FR1 of
// reorder-locations-by-drag-and-drop.
// Verifies FR1, FR7, FR8, FR10 of add-grid-hour-cells-and-hour-frame (D5).
// Verifies FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4): the shared
// view location list serves the Cards view and the Grid view.
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { LocationsLoadStatus } from "@/ports";
import { removeLocationThroughMenu } from "@/test/removeLocationThroughMenu";
import { renderCards, savedLocations } from "@/test/renderViewLocationList";
import { stubZoneCitiesFetch } from "@/test/stubZoneCitiesFetch";

describe("ViewLocationList with card rows", () => {
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
