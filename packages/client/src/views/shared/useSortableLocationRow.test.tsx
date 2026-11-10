// Verifies FR1 of fix-grid-meeting-range-lock-and-layering: the row's list
// item is registered as the sortable node.
import * as sortable from "@dnd-kit/sortable";
import { render, screen } from "@testing-library/react";
import { useSortableLocationRow } from "./useSortableLocationRow";

vi.mock("@dnd-kit/sortable", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/sortable")>();
  return { ...actual, useSortable: vi.fn() };
});

function Row() {
  const { setItemRef } = useSortableLocationRow("kolkata", false, false);
  return <li ref={setItemRef}>Kolkata</li>;
}

describe("useSortableLocationRow", () => {
  it("should register the list item as the sortable node", () => {
    const setNodeRef = vi.fn();
    vi.mocked(sortable.useSortable).mockReturnValue({
      attributes: {},
      listeners: undefined,
      setNodeRef,
      setActivatorNodeRef: vi.fn(),
      transform: null,
      transition: undefined,
      isDragging: false,
      isSorting: false,
    } as unknown as ReturnType<typeof sortable.useSortable>);

    render(
      <ul>
        <Row />
      </ul>,
    );

    expect(setNodeRef).toHaveBeenCalledWith(screen.getByRole("listitem"));
  });
});
