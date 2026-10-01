// Verifies FR3 of reorder-locations-by-drag-and-drop: what a drop emits.
// jsdom has no layout, so the drag itself is replaced by calling the handler
// the list gives to DndContext; real dragging is covered by the E2E feature.
import type { DndContextProps } from "@dnd-kit/core";
import { render } from "@testing-library/react";
import type { LocationRow } from "@/presenter";
import { LocationList } from "./LocationList";

let dropHandler: DndContextProps["onDragEnd"];

vi.mock("@dnd-kit/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/core")>();
  return {
    ...actual,
    DndContext: (props: DndContextProps) => {
      dropHandler = props.onDragEnd;
      return <actual.DndContext {...props} />;
    },
  };
});

const rows: LocationRow[] = ["moscow", "tokyo", "kyiv"].map((id) => ({
  id,
  cityLabel: id,
  countryName: "",
  utcOffsetLabel: "",
}));

const dropOver = (activeId: string, overId: string | null) =>
  dropHandler?.({
    active: { id: activeId },
    over: overId === null ? null : { id: overId },
  } as Parameters<NonNullable<DndContextProps["onDragEnd"]>>[0]);

describe("LocationList drop", () => {
  it("should emit the moved id and the index of the row it is dropped over", () => {
    const onMove = vi.fn();
    render(<LocationList rows={rows} onRemove={vi.fn()} onMove={onMove} />);
    dropOver("moscow", "kyiv");
    expect(onMove).toHaveBeenCalledExactlyOnceWith("moscow", 2);
  });

  it.each([
    ["outside the list", null],
    ["on itself", "tokyo"],
  ])("should emit nothing when dropped %s", (_case, overId) => {
    const onMove = vi.fn();
    render(<LocationList rows={rows} onRemove={vi.fn()} onMove={onMove} />);
    dropOver("tokyo", overId);
    expect(onMove).not.toHaveBeenCalled();
  });
});
