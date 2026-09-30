// Verifies FR10, UX4 of add-locations-via-search.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import type { LocationRow } from "@/presenter";
import { LocationList } from "./LocationList";

const rows: LocationRow[] = [
  { id: "moscow", cityLabel: "Moscow", countryName: "Russia" },
  { id: "tokyo", cityLabel: "Tokyo", countryName: "Japan" },
  { id: "kyiv", cityLabel: "Kyiv", countryName: "Ukraine" },
];

describe("LocationList", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should show city and country of each row in list order", () => {
    render(<LocationList rows={rows} onRemove={vi.fn()} />);
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
    render(<LocationList rows={rows} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Tokyo" }));
    expect(onRemove).toHaveBeenCalledWith("tokyo");
  });

  it("should move focus to the next remove action after a removal", async () => {
    const { rerender } = render(<LocationList rows={rows} onRemove={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Tokyo" }));
    rerender(<LocationList rows={[rows[0], rows[2]]} onRemove={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Remove Kyiv" })).toHaveFocus();
  });

  it("should move focus to the previous remove action after removing the last row", async () => {
    const { rerender } = render(<LocationList rows={rows} onRemove={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Kyiv" }));
    rerender(<LocationList rows={[rows[0], rows[1]]} onRemove={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Remove Tokyo" })).toHaveFocus();
  });
});
