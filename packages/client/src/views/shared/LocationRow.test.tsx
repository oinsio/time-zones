// Verifies FR1, FR6, UX1 of show-utc-offset-on-location-rows (D5).
// Verifies FR1 of reorder-locations-by-drag-and-drop.
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import type { LocationRow as LocationRowModel } from "@/presenter";
import { LocationRow } from "./LocationRow";

const row: LocationRowModel = {
  id: "kolkata",
  cityLabel: "Kolkata",
  countryName: "India",
  utcOffsetLabel: "UTC+5:30",
};

const renderRow = (
  overrides: Partial<LocationRowModel> = {},
  isReorderable = true,
) =>
  render(
    <DndContext>
      <SortableContext items={[row.id]}>
        <ul>
          <LocationRow
            row={{ ...row, ...overrides }}
            onRemove={vi.fn()}
            isReorderable={isReorderable}
            prefersReducedMotion={false}
          />
        </ul>
      </SortableContext>
    </DndContext>,
  );

describe("LocationRow", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should show the offset after the country on the muted secondary line", () => {
    renderRow();
    const secondaryLine = screen.getByText("India").parentElement;
    expect(secondaryLine).toHaveTextContent("IndiaUTC+5:30");
    expect(secondaryLine).toHaveClass("text-muted-foreground");
    expect(secondaryLine).toContainElement(screen.getByText("UTC+5:30"));
  });

  it("should still show the offset when the country name is empty", () => {
    renderRow({ countryName: "" });
    expect(screen.getByText("UTC+5:30")).toBeInTheDocument();
  });

  it("should show no offset element and keep the remove action when the offset label is empty", () => {
    renderRow({ utcOffsetLabel: "" });
    expect(screen.queryByText(/UTC/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove Kolkata" }),
    ).toBeInTheDocument();
  });

  it("should show no secondary line when both country and offset are empty", () => {
    renderRow({ countryName: "", utcOffsetLabel: "" });
    expect(screen.getByRole("listitem")).toHaveTextContent(/^Kolkata$/);
  });

  it("should show the move handle when reorderable", () => {
    renderRow();
    expect(
      screen.getByRole("button", { name: "Move Kolkata" }),
    ).toBeInTheDocument();
  });

  it("should show no move handle when not reorderable", () => {
    renderRow({}, false);
    expect(screen.queryByRole("button", { name: /^Move / })).toBeNull();
  });
});
