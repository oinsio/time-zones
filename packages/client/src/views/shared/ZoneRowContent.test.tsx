// Verifies FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4): without a row variant the content is the card's.
import { render, screen } from "@testing-library/react";
import { WallTimeInputOutcome } from "@/controller";
import { ZoneLinePartKind } from "@/presenter";
import { LocationRowVariant } from "./locationRowVariant";
import { ZoneRowContent } from "./ZoneRowContent";

const renderContent = (rowVariant?: LocationRowVariant) =>
  render(
    <ZoneRowContent
      rowVariant={rowVariant}
      cityLabel="Almaty"
      ids={{ city: "city", mark: "mark", difference: "difference" }}
      offsetDifferenceLabel=""
      offsetDifferenceAccessibleLabel=""
      zoneLineParts={[{ kind: ZoneLinePartKind.PLACE, text: "Kazakhstan" }]}
      localTimeLabel="12:30"
      localDateLabel="Sun, Mar 8"
      localIsoDate="2026-03-08"
      wallTimeInputLabel="Enter time"
      onConfirmWallTime={() => WallTimeInputOutcome.CLOSED}
      onSelectTrackFraction={() => undefined}
      onMoveTrack={() => undefined}
    />,
  );

describe("ZoneRowContent without a row variant", () => {
  it("should put the time button before the date", () => {
    renderContent();
    const timeButton = screen.getByRole("button", { name: "Enter time" });
    const dateElement = screen.getByText("Sun, Mar 8");
    expect(
      timeButton.compareDocumentPosition(dateElement) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("should keep the card place and time block from growing", () => {
    renderContent();
    const placeAndTime =
      screen.getByText("Almaty").parentElement?.parentElement?.parentElement;
    expect(placeAndTime).toHaveClass("md:flex-none");
  });

  it("should keep the card's fixed width for the place column", () => {
    renderContent();
    expect(screen.getByText("Almaty").parentElement?.parentElement).toHaveClass(
      "md:w-64",
    );
  });
});

describe("ZoneRowContent for a grid row", () => {
  it("should let the place column share the line with the city", () => {
    renderContent(LocationRowVariant.GRID_ROW);
    const placeColumn = screen.getByText("Almaty").parentElement?.parentElement;
    expect(placeColumn).toHaveClass("md:flex-row");
    expect(placeColumn).not.toHaveClass("md:w-64");
  });

  it("should let the place and time block grow", () => {
    renderContent(LocationRowVariant.GRID_ROW);
    const placeAndTime =
      screen.getByText("Almaty").parentElement?.parentElement?.parentElement;
    expect(placeAndTime).toHaveClass("md:flex-1");
    expect(placeAndTime).not.toHaveClass("md:flex-none");
  });
});
