// Verifies FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4): without a row variant the content is the card's.
import { render, screen } from "@testing-library/react";
import { WallTimeInputOutcome } from "@/controller";
import { ZoneLinePartKind } from "@/presenter";
import { ZoneRowContent } from "./ZoneRowContent";

const renderContent = () =>
  render(
    <ZoneRowContent
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

  it("should keep the card's fixed width for the place column", () => {
    renderContent();
    expect(screen.getByText("Almaty").parentElement?.parentElement).toHaveClass(
      "md:w-64",
    );
  });
});
