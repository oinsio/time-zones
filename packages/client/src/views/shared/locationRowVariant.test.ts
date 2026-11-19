// Verifies FR8 of fix-grid-meeting-range-lock-and-layering: the layer tokens of the row boxes.
// Verifies FR2 of make-location-menu-button-vertical: no gap before the menu button.
// Verifies FR7, FR8, FR17 of redesign-cards-grid-and-day-palettes: the two layouts and the sizes.
import {
  GRID_MARK_ICON_SIZE_PX,
  LOCATION_MARK_ICON_SIZE_PX,
} from "@/constants";
import {
  LOCATION_ROW_VARIANT_CLASS_NAMES,
  LocationRowVariant,
} from "./locationRowVariant";

const cardClassNames =
  LOCATION_ROW_VARIANT_CLASS_NAMES[LocationRowVariant.CARD];
const gridClassNames =
  LOCATION_ROW_VARIANT_CLASS_NAMES[LocationRowVariant.GRID_ROW];

describe("LOCATION_ROW_VARIANT_CLASS_NAMES", () => {
  it("should stack the Cards rows in a column with the card gap", () => {
    expect(cardClassNames.list).toBe("flex flex-col gap-card-gap");
  });

  it("should draw a Cards row as a flat surface with the card radius and border", () => {
    expect(cardClassNames.row).toContain(
      "rounded-card border border-card-border bg-surface",
    );
  });

  it("should have only two layouts, narrow and wide: no fixed-width columns", () => {
    for (const classNames of [cardClassNames, gridClassNames]) {
      expect(classNames.place).not.toMatch(/md:w-\d/);
      expect(classNames.timeGroup).not.toMatch(/md:w-\d/);
    }
  });

  it("should put no gap between the time and the menu button", () => {
    for (const classNames of [cardClassNames, gridClassNames]) {
      expect(classNames.timeGroup).not.toMatch(/gap-x-/);
    }
  });

  it("should let the line wrappers join the header from md", () => {
    expect(cardClassNames.lineOne).toContain("md:contents");
    expect(cardClassNames.lineTwo).toContain("md:contents");
  });

  it("should move the time to its own line at the right when the place needs the room", () => {
    expect(cardClassNames.place).toContain("flex-wrap");
    expect(cardClassNames.place).toContain("min-w-[min-content]");
    expect(cardClassNames.timeGroup).toContain("ml-auto");
  });

  it("should show the day track and a menu placed inside the Cards row", () => {
    expect(cardClassNames.hasDayTrack).toBe(true);
    expect(cardClassNames.isMenuFixedToViewport).toBe(false);
  });

  it.each([
    [cardClassNames, LOCATION_MARK_ICON_SIZE_PX],
    [gridClassNames, GRID_MARK_ICON_SIZE_PX],
  ])("should size the mark icon by the variant", (classNames, size) => {
    expect(classNames.markSizePx).toBe(size);
  });

  it("should let the Grid panel scroll its strips sideways", () => {
    expect(gridClassNames.list).toContain("overflow-x-auto");
  });

  it("should make the Grid header and notes boxes sticky on the box layer", () => {
    expect(gridClassNames.headerBox).toContain("sticky");
    expect(gridClassNames.headerBox).toContain("z-grid-box");
    expect(gridClassNames.notesBox).toContain("sticky");
    expect(gridClassNames.notesBox).toContain("z-grid-box");
  });

  it("should raise a focused header box and one with an open menu on different layers", () => {
    expect(gridClassNames.headerBoxLayer).toBe(
      "focus-within:z-grid-box-focused",
    );
    expect(gridClassNames.headerBoxLayerWithOpenMenu).toBe("z-location-menu");
  });

  it("should show no day track in the Grid and fix its menu to the viewport", () => {
    expect(gridClassNames.hasDayTrack).toBe(false);
    expect(gridClassNames.isMenuFixedToViewport).toBe(true);
  });

  it("should use the card border for the Grid panel and its dividers", () => {
    expect(gridClassNames.list).toContain("border-card-border");
    expect(gridClassNames.row).toContain("border-card-border");
  });
});
