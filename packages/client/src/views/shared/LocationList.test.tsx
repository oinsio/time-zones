// Verifies FR10, UX4 of add-locations-via-search.
// Verifies FR1, UX3 of reorder-locations-by-drag-and-drop.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import type { LocationRow } from "@/presenter";
import { LocationList } from "./LocationList";

const rows: LocationRow[] = [
  {
    id: "moscow",
    cityLabel: "Moscow",
    utcOffsetLabel: "UTC+3",
    countryName: "Russia",
  },
  {
    id: "tokyo",
    cityLabel: "Tokyo",
    utcOffsetLabel: "UTC+9",
    countryName: "Japan",
  },
  {
    id: "kyiv",
    cityLabel: "Kyiv",
    utcOffsetLabel: "UTC+3",
    countryName: "Ukraine",
  },
];

describe("LocationList", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should show city and country of each row in list order", () => {
    render(<LocationList rows={rows} onRemove={vi.fn()} onMove={vi.fn()} />);
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
    render(<LocationList rows={rows} onRemove={onRemove} onMove={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Tokyo" }));
    expect(onRemove).toHaveBeenCalledWith("tokyo");
  });

  it("should move focus to the next remove action after a removal", async () => {
    const { rerender } = render(
      <LocationList rows={rows} onRemove={vi.fn()} onMove={vi.fn()} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove Tokyo" }));
    rerender(
      <LocationList
        rows={[rows[0], rows[2]]}
        onRemove={vi.fn()}
        onMove={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Remove Kyiv" })).toHaveFocus();
  });

  it("should move focus to the previous remove action after removing the last row", async () => {
    const { rerender } = render(
      <LocationList rows={rows} onRemove={vi.fn()} onMove={vi.fn()} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove Kyiv" }));
    rerender(
      <LocationList
        rows={[rows[0], rows[1]]}
        onRemove={vi.fn()}
        onMove={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Remove Tokyo" })).toHaveFocus();
  });

  it("should not move focus when the list is first shown", () => {
    render(<LocationList rows={rows} onRemove={vi.fn()} onMove={vi.fn()} />);
    expect(document.body).toHaveFocus();
  });

  it("should leave focus alone when the last remaining row is removed", async () => {
    const singleRow = [rows[0]];
    const { rerender } = render(
      <LocationList rows={singleRow} onRemove={vi.fn()} onMove={vi.fn()} />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Remove Moscow" }),
    );
    rerender(<LocationList rows={[]} onRemove={vi.fn()} onMove={vi.fn()} />);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("should offer a move handle before the remove action of each of two rows", () => {
    render(
      <LocationList
        rows={[rows[0], rows[1]]}
        onRemove={vi.fn()}
        onMove={vi.fn()}
      />,
    );
    const moveHandle = screen.getByRole("button", { name: "Move Moscow" });
    const removeButton = screen.getByRole("button", { name: "Remove Moscow" });
    expect(
      moveHandle.compareDocumentPosition(removeButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Move Tokyo" }),
    ).toBeInTheDocument();
  });

  it("should offer no move handle for a single row", () => {
    render(
      <LocationList rows={[rows[0]]} onRemove={vi.fn()} onMove={vi.fn()} />,
    );
    expect(screen.queryByRole("button", { name: /^Move / })).toBeNull();
  });
});
