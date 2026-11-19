// Verifies FR1, FR2, UX1 of fix-grid-meeting-range-lock-and-layering.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { LocationRow } from "@/presenter";
import { ignoreWallTime } from "@/test/ignoreWallTime";
import { LocationList } from "./LocationList";
import { LocationRowVariant } from "./locationRowVariant";

const rows: LocationRow[] = ["Moscow", "Tokyo"].map((cityLabel) => ({
  id: cityLabel,
  cityLabel,
  countryName: "",
  utcOffsetLabel: "",
  zoneAbbreviationLabel: "",
  zoneLineParts: [],
  offsetDifferenceLabel: "",
  offsetDifferenceAccessibleLabel: "",
  localTimeLabel: "",
  localTimeParts: { digits: "", dayPeriodMarker: "" },
  localDateLabel: "",
  localIsoDate: "",
  wallTimeInputLabel: "",
}));

const renderList = (areRowControlsLocked: boolean) => {
  const onMove = vi.fn();
  render(
    <LocationList
      rows={rows}
      onRemove={vi.fn()}
      onSetHome={vi.fn()}
      onMove={onMove}
      onSelectTrackFraction={vi.fn()}
      onMoveTrack={vi.fn()}
      onConfirmWallTime={ignoreWallTime}
      rowVariant={LocationRowVariant.GRID_ROW}
      hourGrid={{
        renderHourStrip: () => null,
        frame: null,
        panelRef: () => undefined,
        panelStyle: {},
        areRowControlsLocked,
      }}
    />,
  );
  return { onMove };
};
const grabAreaOf = (city: string) => {
  const cityElement = screen.getAllByText(city)[0];
  return cityElement.parentElement as HTMLElement;
};

describe("LocationRow with locked controls", () => {
  it.each(["Moscow", "Tokyo"])(
    "should disable the menu button and give the grab area of %s the default cursor",
    (city) => {
      renderList(true);
      const buttons = screen
        .getAllByRole("button")
        .filter((button) => button.getAttribute("aria-label")?.endsWith(city));
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toBeDisabled();
      expect(buttons[0]).toHaveClass("disabled:opacity-40");
      expect(grabAreaOf(city)).toHaveClass("cursor-default");
      expect(grabAreaOf(city)).not.toHaveClass("cursor-grab");
    },
  );

  it("should open no menu on a click of the menu button", async () => {
    renderList(true);
    const [menuButton] = screen
      .getAllByRole("button")
      .filter((button) => button.getAttribute("aria-haspopup") === "menu");

    await userEvent.click(menuButton);

    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("should move nothing on a pointer drag of the grab area", async () => {
    const { onMove } = renderList(true);

    await userEvent.pointer([
      { keys: "[MouseLeft>]", target: grabAreaOf("Moscow") },
      { coords: { x: 0, y: 200 } },
      { keys: "[/MouseLeft]" },
    ]);

    expect(onMove).not.toHaveBeenCalled();
  });

  it("should keep the controls enabled and the grab cursor without the lock", () => {
    renderList(false);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeEnabled();
    }
    expect(grabAreaOf("Moscow")).toHaveClass("cursor-grab");
  });
});
