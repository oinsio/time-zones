// UX3 of support-legacy-ios-12-safari: no empty country element in a row.
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import type { LocationRow as LocationRowModel } from "@/presenter";
import { LocationRow } from "./LocationRow";

const countrylessRow: LocationRowModel = {
  id: "kyiv",
  cityLabel: "Kyiv",
  countryName: "",
  utcOffsetLabel: "UTC+2",
  offsetDifferenceLabel: "",
  offsetDifferenceAccessibleLabel: "",
  localTimeLabel: "",
  localDateLabel: "",
  localIsoDate: "",
};

describe("LocationRow without a country name", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should render the offset as the only element of the secondary line", () => {
    render(
      <DndContext>
        <SortableContext items={[countrylessRow.id]}>
          <ul>
            <LocationRow
              row={countrylessRow}
              onRemove={vi.fn()}
              onSelectTrackFraction={vi.fn()}
              onMoveTrack={vi.fn()}
              isReorderable
              prefersReducedMotion={false}
            />
          </ul>
        </SortableContext>
      </DndContext>,
    );

    const secondaryLine = screen.getByText("UTC+2").parentElement;
    expect(secondaryLine?.children).toHaveLength(1);
  });
});
