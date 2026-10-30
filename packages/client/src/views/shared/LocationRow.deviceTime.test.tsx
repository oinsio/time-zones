// Verifies FR8, UX3 of add-settings-page-and-device-time-location (D4).
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import {
  LocationMarkKind,
  type LocationRow as LocationRowModel,
} from "@/presenter";
import { ignoreWallTime } from "@/test/ignoreWallTime";
import { ALMATY_TRACK } from "./dayTrackFixture";
import { LocationRow } from "./LocationRow";

const deviceTimeRow: LocationRowModel = {
  id: "device-time",
  cityLabel: "Almaty",
  countryName: "",
  utcOffsetLabel: "UTC+5",
  offsetDifferenceLabel: "",
  offsetDifferenceAccessibleLabel: "",
  localTimeLabel: "12:30",
  localDateLabel: "Sun, Mar 8",
  localIsoDate: "2026-03-08",
  wallTimeInputLabel: "",
  dayTrack: ALMATY_TRACK,
  mark: {
    kind: LocationMarkKind.HERE,
    accessibleLabel: "You are here",
    caption: "here",
  },
  metaLabel: "Device time · UTC+5",
  accessibleName: "Almaty, You are here, Device time",
};

const renderRow = (row: LocationRowModel) =>
  render(
    <DndContext>
      <SortableContext items={[row.id]}>
        <ul>
          <LocationRow
            row={row}
            onRemove={vi.fn()}
            onSetHome={vi.fn()}
            onSelectTrackFraction={vi.fn()}
            onMoveTrack={vi.fn()}
            onConfirmWallTime={ignoreWallTime}
            isReorderable
            prefersReducedMotion={false}
          />
        </ul>
      </SortableContext>
    </DndContext>,
  );

describe("LocationRow of the device time location", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should show the meta line in place of the country and offset", () => {
    renderRow(deviceTimeRow);
    expect(screen.getByText("Device time · UTC+5")).toBeInTheDocument();
    expect(screen.queryByText("UTC+5")).not.toBeInTheDocument();
  });

  it("should use the accessible name of the row for the item", () => {
    renderRow(deviceTimeRow);
    expect(
      screen.getByRole("listitem", {
        name: "Almaty, You are here, Device time",
      }),
    ).toBeInTheDocument();
  });

  it("should offer the same controls as a city card", () => {
    renderRow(deviceTimeRow);
    expect(
      screen.getByRole("button", { name: "Move Almaty" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Actions for Almaty" }),
    ).toBeInTheDocument();
  });

  it("should show the country and offset of a city row", () => {
    renderRow({
      ...deviceTimeRow,
      id: "moscow",
      cityLabel: "Moscow",
      countryName: "Russia",
      metaLabel: undefined,
      accessibleName: undefined,
      mark: undefined,
    });
    expect(screen.getByText("Russia")).toBeInTheDocument();
    expect(screen.getByText("UTC+5")).toBeInTheDocument();
  });
});
