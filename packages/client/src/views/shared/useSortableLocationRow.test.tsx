// Verifies FR15 of redesign-cards-grid-and-day-palettes: the picked-up row is lifted.
import * as dndSortable from "@dnd-kit/sortable";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { REORDER_LIFT_SCALE } from "@/constants";
import { useSortableLocationRow } from "./useSortableLocationRow";

vi.mock("@dnd-kit/sortable", async (importOriginal) => {
  const original = await importOriginal<typeof import("@dnd-kit/sortable")>();
  return { ...original, useSortable: vi.fn() };
});

const sortableState = (isDragging: boolean) =>
  ({
    listeners: undefined,
    setNodeRef: vi.fn(),
    setActivatorNodeRef: vi.fn(),
    transform: { x: 0, y: 40, scaleX: 1, scaleY: 1 },
    transition: undefined,
    isDragging,
    isSorting: isDragging,
  }) as unknown as ReturnType<typeof dndSortable.useSortable>;

describe("useSortableLocationRow", () => {
  afterEach(() => vi.mocked(dndSortable.useSortable).mockReset());

  it("should scale the dragged row by the lift scale and give it the lift shadow", () => {
    vi.mocked(dndSortable.useSortable).mockReturnValue(sortableState(true));

    const { result } = renderHook(() =>
      useSortableLocationRow("moscow", false, false),
    );

    expect(result.current.style.transform).toContain(
      `scaleX(${REORDER_LIFT_SCALE})`,
    );
    expect(result.current.draggingClassName).toContain("shadow-lift");
    expect(result.current.draggingClassName).toContain("z-dragged-row");
  });

  it("should not scale a row at rest", () => {
    vi.mocked(dndSortable.useSortable).mockReturnValue(sortableState(false));

    const { result } = renderHook(() =>
      useSortableLocationRow("moscow", false, false),
    );

    expect(result.current.style.transform).toContain("scaleX(1)");
    expect(result.current.draggingClassName).toBe("");
  });

  it("should not expose draggable attributes: the grab area is no button", () => {
    vi.mocked(dndSortable.useSortable).mockReturnValue(sortableState(false));

    const { result } = renderHook(() =>
      useSortableLocationRow("moscow", false, false),
    );

    expect(result.current).not.toHaveProperty("attributes");
  });
});
