// Verifies FR8, UX3 of fix-grid-meeting-range-lock-and-layering (D6): the surface background lies behind the glyphs only.
// Verifies FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4): without a row variant the content is the card's.
// Verifies FR7, FR8, FR9, FR10, FR15 of redesign-cards-grid-and-day-palettes: the two lines of the row header and the grab area.
import { render, screen } from "@testing-library/react";
import { WallTimeInputOutcome } from "@/controller";
import { ZoneLinePartKind } from "@/presenter";
import { LocationRowVariant } from "./locationRowVariant";
import { ZoneRowContent } from "./ZoneRowContent";

const renderContent = (
  rowVariant?: LocationRowVariant,
  grabAreaProps?: Parameters<typeof ZoneRowContent>[0]["grabAreaProps"],
  zoneLineParts = [{ kind: ZoneLinePartKind.PLACE, text: "Kazakhstan" }],
) =>
  render(
    <ZoneRowContent
      rowVariant={rowVariant}
      cityLabel="Almaty"
      ids={{ city: "city", mark: "mark", difference: "difference" }}
      offsetDifferenceLabel="+2 h"
      offsetDifferenceAccessibleLabel="2 hours ahead"
      zoneLineParts={zoneLineParts}
      localTimeLabel="12:30"
      localTimeParts={{ digits: "12:30", dayPeriodMarker: "" }}
      localDateLabel="Sun, Mar 8"
      localIsoDate="2026-03-08"
      wallTimeInputLabel="Enter time"
      onConfirmWallTime={() => WallTimeInputOutcome.CLOSED}
      onSelectTrackFraction={() => undefined}
      onMoveTrack={() => undefined}
      grabAreaProps={grabAreaProps}
      menu={<button type="button">menu</button>}
    />,
  );

const follows = (first: HTMLElement, second: HTMLElement) =>
  Boolean(
    first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
  );

describe("ZoneRowContent", () => {
  it("should put the menu button after the time button, in the time group", () => {
    renderContent();
    const timeButton = screen.getByRole("button", { name: "Enter time" });
    const menu = screen.getByRole("button", { name: "menu" });
    expect(follows(timeButton, menu)).toBe(true);
    expect(timeButton.parentElement).toBe(menu.parentElement);
  });

  it("should put the zone line and the date on a second line, the date after the zone line", () => {
    const { container } = renderContent();
    const zoneLine = container.querySelector("[data-zone-line]") as HTMLElement;
    const date = screen.getByText("Sun, Mar 8");
    expect(follows(zoneLine, date)).toBe(true);
    expect(zoneLine.parentElement?.parentElement).toBe(
      date.parentElement?.parentElement,
    );
  });

  it("should keep the difference right after the city in the place", () => {
    renderContent();
    const city = screen.getByText("Almaty");
    expect(city.parentElement).toContainElement(screen.getByText("+2 h"));
    expect(follows(city, screen.getByText("+2 h"))).toBe(true);
  });

  it("should let the place wrap and never be narrower than its longest word", () => {
    renderContent();
    expect(screen.getByText("Almaty").parentElement).toHaveClass(
      "flex-wrap",
      "min-w-[min-content]",
    );
  });

  it("should give the place and the zone line the grab area props", () => {
    const onPointerDown = vi.fn();
    const { container } = renderContent(undefined, {
      onPointerDown,
      className: "cursor-grab",
    });

    expect(screen.getByText("Almaty").parentElement).toHaveClass("cursor-grab");
    expect(
      container.querySelector("[data-zone-line]")?.parentElement,
    ).toHaveClass("cursor-grab");
  });

  it("should leave the time, the menu and the day track out of the grab area", () => {
    renderContent(undefined, { className: "cursor-grab" });

    expect(
      screen
        .getByRole("button", { name: "Enter time" })
        .closest(".cursor-grab"),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "menu" }).closest(".cursor-grab"),
    ).toBeNull();
  });

  it("should show no zone line element without parts", () => {
    const { container } = renderContent(undefined, undefined, []);
    expect(container.querySelector("[data-zone-line]")).toBeNull();
  });
});

describe("ZoneRowContent for a grid row", () => {
  it("should size the city by the grid sizes", () => {
    renderContent(LocationRowVariant.GRID_ROW);
    expect(screen.getByText("Almaty")).toHaveClass(
      "text-grid-city",
      "md:text-grid-city-wide",
    );
  });

  it("should show no day track", () => {
    const { container } = renderContent(LocationRowVariant.GRID_ROW);
    expect(container.querySelector("[data-day-track]")).toBeNull();
  });
});

describe("ZoneRowContent glyph backgrounds", () => {
  it("should not paint the zone line container with the surface", () => {
    const { container } = renderContent(LocationRowVariant.GRID_ROW);
    expect(container.querySelector("[data-zone-line]")).not.toHaveClass(
      "bg-surface",
    );
  });

  it("should paint each zone line part with the surface", () => {
    renderContent(LocationRowVariant.GRID_ROW);
    expect(screen.getByText("Kazakhstan")).toHaveClass("bg-surface");
  });
});
