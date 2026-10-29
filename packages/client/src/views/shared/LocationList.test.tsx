// Verifies FR10, UX4 of add-locations-via-search.
// Verifies FR1, UX3 of reorder-locations-by-drag-and-drop.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import type { LocationRow } from "@/presenter";
import { removeLocationThroughMenu } from "@/test/removeLocationThroughMenu";
import { LocationList } from "./LocationList";

const rows: LocationRow[] = [
  {
    id: "moscow",
    cityLabel: "Moscow",
    utcOffsetLabel: "UTC+3",
    offsetDifferenceLabel: "",
    offsetDifferenceAccessibleLabel: "",
    localTimeLabel: "",
    localDateLabel: "",
    localIsoDate: "",
    countryName: "Russia",
  },
  {
    id: "tokyo",
    cityLabel: "Tokyo",
    utcOffsetLabel: "UTC+9",
    offsetDifferenceLabel: "",
    offsetDifferenceAccessibleLabel: "",
    localTimeLabel: "",
    localDateLabel: "",
    localIsoDate: "",
    countryName: "Japan",
  },
  {
    id: "kyiv",
    cityLabel: "Kyiv",
    utcOffsetLabel: "UTC+3",
    offsetDifferenceLabel: "",
    offsetDifferenceAccessibleLabel: "",
    localTimeLabel: "",
    localDateLabel: "",
    localIsoDate: "",
    countryName: "Ukraine",
  },
];

const noopHandlers = {
  onRemove: vi.fn(),
  onSetHome: () => undefined,
  onMove: vi.fn(),
  onSelectTrackFraction: () => undefined,
  onMoveTrack: () => undefined,
};

describe("LocationList", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should show city and country of each row in list order", () => {
    render(<LocationList {...noopHandlers} rows={rows} />);
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining("Moscow"),
      expect.stringContaining("Tokyo"),
      expect.stringContaining("Kyiv"),
    ]);
    expect(within(items[0]).getByText("Russia")).toBeInTheDocument();
  });

  it("should emit the row id when its remove action is used", async () => {
    const onRemove = vi.fn();
    render(<LocationList {...noopHandlers} rows={rows} onRemove={onRemove} />);
    await removeLocationThroughMenu("Tokyo");
    expect(onRemove).toHaveBeenCalledWith("tokyo");
  });

  it("should move focus to the next remove action after a removal", async () => {
    const { rerender } = render(<LocationList {...noopHandlers} rows={rows} />);
    await removeLocationThroughMenu("Tokyo");
    rerender(<LocationList {...noopHandlers} rows={[rows[0], rows[2]]} />);
    expect(
      screen.getByRole("button", { name: "Actions for Kyiv" }),
    ).toHaveFocus();
  });

  it("should move focus to the previous remove action after removing the last row", async () => {
    const { rerender } = render(<LocationList {...noopHandlers} rows={rows} />);
    await removeLocationThroughMenu("Kyiv");
    rerender(<LocationList {...noopHandlers} rows={[rows[0], rows[1]]} />);
    expect(
      screen.getByRole("button", { name: "Actions for Tokyo" }),
    ).toHaveFocus();
  });

  it("should not move focus when the list is first shown", () => {
    render(<LocationList {...noopHandlers} rows={rows} />);
    expect(document.body).toHaveFocus();
  });

  it("should leave focus alone when the last remaining row is removed", async () => {
    const singleRow = [rows[0]];
    const { rerender } = render(
      <LocationList {...noopHandlers} rows={singleRow} />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Actions for Moscow" }),
    );
    rerender(<LocationList {...noopHandlers} rows={[]} />);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("should offer a move handle before the remove action of each of two rows", () => {
    render(<LocationList {...noopHandlers} rows={[rows[0], rows[1]]} />);
    const moveHandle = screen.getByRole("button", { name: "Move Moscow" });
    const removeButton = screen.getByRole("button", {
      name: "Actions for Moscow",
    });
    expect(
      moveHandle.compareDocumentPosition(removeButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Move Tokyo" }),
    ).toBeInTheDocument();
  });

  it("should offer no move handle for a single row", () => {
    render(<LocationList {...noopHandlers} rows={[rows[0]]} />);
    expect(screen.queryByRole("button", { name: /^Move / })).toBeNull();
  });
});
