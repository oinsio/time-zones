// Verifies FR16, NFR-A3 of redesign-cards-grid-and-day-palettes: the items of the location menu.
import { renderHook } from "@testing-library/react";
import i18n from "i18next";
import { LocationMarkKind, type LocationRow } from "@/presenter";
import { ALMATY_TRACK } from "./dayTrackFixture";
import { MENU_MOVE_STEP, useLocationMenuItems } from "./useLocationMenuItems";

const row = (overrides: Partial<LocationRow> = {}): LocationRow => ({
  id: "moscow",
  cityLabel: "Moscow",
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
  dayTrack: ALMATY_TRACK,
  ...overrides,
});

const itemsAt = (
  rowIndex: number,
  rowCount: number,
  rowOverrides: Partial<LocationRow> = {},
  onMoveStep = vi.fn(),
) =>
  renderHook(() =>
    useLocationMenuItems(
      row(rowOverrides),
      { rowIndex, rowCount },
      vi.fn(),
      vi.fn(),
      onMoveStep,
    ),
  ).result.current;

describe("useLocationMenuItems", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should list the home action, Move up, Move down and Remove in that order", () => {
    expect(itemsAt(1, 3).map((item) => item.label)).toEqual([
      "Make home",
      "Move up",
      "Move down",
      "Remove",
    ]);
  });

  it("should name Clear home on the home row", () => {
    const [homeItem] = itemsAt(1, 3, {
      mark: { kind: LocationMarkKind.HOME, accessibleLabel: "Home" },
    });
    expect(homeItem.label).toBe("Clear home");
  });

  it.each([
    [0, 3, true, false],
    [1, 3, false, false],
    [2, 3, false, true],
    [0, 1, true, true],
  ])(
    "should disable the moves that cannot apply at row %i of %i",
    (rowIndex, rowCount, isUpDisabled, isDownDisabled) => {
      const items = itemsAt(rowIndex, rowCount);
      const moveUp = items.find((item) => item.label === "Move up");
      const moveDown = items.find((item) => item.label === "Move down");
      expect(moveUp?.isDisabled).toBe(isUpDisabled);
      expect(moveDown?.isDisabled).toBe(isDownDisabled);
    },
  );

  it("should move one place up or down by the row id", () => {
    const onMoveStep = vi.fn();
    const items = itemsAt(1, 3, {}, onMoveStep);

    items.find((item) => item.label === "Move up")?.onSelect();
    items.find((item) => item.label === "Move down")?.onSelect();

    expect(onMoveStep).toHaveBeenNthCalledWith(1, "moscow", -MENU_MOVE_STEP);
    expect(onMoveStep).toHaveBeenNthCalledWith(2, "moscow", MENU_MOVE_STEP);
  });

  it("should not disable Remove or the home action", () => {
    const items = itemsAt(0, 1);
    expect(items[0].isDisabled).toBeUndefined();
    expect(items[3].isDisabled).toBeUndefined();
  });
});
