// Verifies FR8 of fix-grid-meeting-range-lock-and-layering: the layer tokens of the row boxes.
import {
  LOCATION_ROW_VARIANT_CLASS_NAMES,
  LocationRowVariant,
} from "./locationRowVariant";

const cardClassNames = LOCATION_ROW_VARIANT_CLASS_NAMES[LocationRowVariant.CARD];
const gridClassNames =
  LOCATION_ROW_VARIANT_CLASS_NAMES[LocationRowVariant.GRID_ROW];

describe("LOCATION_ROW_VARIANT_CLASS_NAMES", () => {
  it("should stack the Cards rows in a column with a gap", () => {
    expect(cardClassNames.list).toBe("flex flex-col gap-2");
  });

  it("should draw a Cards row as a bordered, padded box", () => {
    expect(cardClassNames.row).toContain("rounded-md border border-border");
  });

  it("should keep the Cards place and time on one line from md", () => {
    expect(cardClassNames.placeAndTime).toBe("md:flex-none");
    expect(cardClassNames.place).toBe("md:w-64 md:flex-none");
  });

  it("should add no class to the Cards city line", () => {
    expect(cardClassNames.cityLine).toBe("");
  });

  it("should show the day track and a menu placed inside the Cards row", () => {
    expect(cardClassNames.hasDayTrack).toBe(true);
    expect(cardClassNames.isMenuFixedToViewport).toBe(false);
    expect(cardClassNames.isDateBeforeTime).toBe(false);
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
    expect(gridClassNames.headerBoxLayer).toBe("focus-within:z-grid-box-focused");
    expect(gridClassNames.headerBoxLayerWithOpenMenu).toBe("z-location-menu");
  });

  it("should keep the Grid date before the time, with no day track and a fixed menu", () => {
    expect(gridClassNames.isDateBeforeTime).toBe(true);
    expect(gridClassNames.hasDayTrack).toBe(false);
    expect(gridClassNames.isMenuFixedToViewport).toBe(true);
  });

  it("should lay the Grid place and date-time columns out per breakpoint", () => {
    expect(gridClassNames.place).toContain("md:flex-row");
    expect(gridClassNames.dateTime).toContain("flex-col-reverse");
    expect(gridClassNames.placeAndTime).toBe("md:flex-1");
  });
});
