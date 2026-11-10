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
const dragHandleOf = (city: string) => {
  const handle = screen
    .getAllByRole("button")
    .find(
      (button) =>
        button.hasAttribute("aria-roledescription") &&
        button.getAttribute("aria-label")?.endsWith(city),
    );
  if (handle === undefined) throw new Error(`no drag handle of ${city}`);
  return handle;
};

describe("LocationRow with locked controls", () => {
  it.each(["Moscow", "Tokyo"])(
    "should disable the drag handle and the menu button of %s",
    (city) => {
      renderList(true);
      const buttons = screen
        .getAllByRole("button")
        .filter((button) => button.getAttribute("aria-label")?.endsWith(city));
      expect(buttons).toHaveLength(2);
      for (const button of buttons) {
        expect(button).toBeDisabled();
        expect(button).toHaveClass("disabled:opacity-40");
      }
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

  it("should move nothing on a keyboard reorder", async () => {
    const { onMove } = renderList(true);
    dragHandleOf("Moscow").focus();

    await userEvent.keyboard(" {ArrowDown} ");

    expect(onMove).not.toHaveBeenCalled();
  });

  it("should keep the controls enabled without the lock", () => {
    renderList(false);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeEnabled();
    }
  });
});
