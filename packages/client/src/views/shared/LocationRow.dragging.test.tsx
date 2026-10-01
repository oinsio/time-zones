// Verifies UX2 of reorder-locations-by-drag-and-drop: the dragged card is
// raised. jsdom cannot drag, so the sortable state is stubbed.
import * as sortable from "@dnd-kit/sortable";
import { render, screen } from "@testing-library/react";
import { LocationRow } from "./LocationRow";

vi.mock("@dnd-kit/sortable", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/sortable")>();
  return { ...actual, useSortable: vi.fn() };
});

const row = {
  id: "kolkata",
  cityLabel: "Kolkata",
  countryName: "India",
  utcOffsetLabel: "UTC+5:30",
};

const renderWithDragging = (isDragging: boolean) => {
  vi.mocked(sortable.useSortable).mockReturnValue({
    attributes: {},
    listeners: undefined,
    setNodeRef: vi.fn(),
    setActivatorNodeRef: vi.fn(),
    transform: { x: 0, y: 12, scaleX: 1, scaleY: 1 },
    transition: "transform 200ms ease",
    isDragging,
  } as unknown as ReturnType<typeof sortable.useSortable>);
  render(
    <ul>
      <LocationRow
        row={row}
        onRemove={vi.fn()}
        isReorderable
        prefersReducedMotion={false}
      />
    </ul>,
  );
  return screen.getByRole("listitem");
};

describe("LocationRow while dragged", () => {
  it("should be raised above the other cards", () => {
    expect(renderWithDragging(true)).toHaveClass(
      "relative",
      "z-10",
      "shadow-lg",
    );
  });

  it("should not be raised at rest", () => {
    expect(renderWithDragging(false)).not.toHaveClass("shadow-lg");
  });

  it("should follow the sortable transform and transition", () => {
    const card = renderWithDragging(true);
    expect(card.style.transform).toContain("translate3d(0px, 12px, 0)");
    expect(card.style.transition).toBe("transform 200ms ease");
  });
});
