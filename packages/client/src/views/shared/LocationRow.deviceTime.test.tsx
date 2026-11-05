// Verifies FR8, UX3 of add-settings-page-and-device-time-location (D4).
// Verifies FR6 of show-zone-abbreviations-and-zone-label-setting (D6).
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { render, screen } from "@testing-library/react";
import i18n from "i18next";
import {
  LocationMarkKind,
  type LocationRow as LocationRowModel,
  ZoneLinePartKind,
} from "@/presenter";
import { ignoreWallTime } from "@/test/ignoreWallTime";
import { ALMATY_TRACK } from "./dayTrackFixture";
import { LocationRow } from "./LocationRow";

const deviceTimeRow: LocationRowModel = {
  id: "device-time",
  cityLabel: "Almaty",
  countryName: "",
  utcOffsetLabel: "UTC+5",
  zoneAbbreviationLabel: "",
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
  zoneLineParts: [
    { kind: ZoneLinePartKind.PLACE, text: "Device time" },
    { kind: ZoneLinePartKind.UTC_OFFSET, text: "UTC+5" },
  ],
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

  it("should show the meta line as the first element of the zone line", () => {
    renderRow(deviceTimeRow);
    expect(screen.getByText("Device time")).toBeInTheDocument();
    expect(screen.getByText("UTC+5")).toBeInTheDocument();
    expect(screen.queryByText(/·/)).not.toBeInTheDocument();
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
      zoneLineParts: [
        { kind: ZoneLinePartKind.PLACE, text: "Russia" },
        { kind: ZoneLinePartKind.UTC_OFFSET, text: "UTC+5" },
      ],
      accessibleName: undefined,
      mark: undefined,
    });
    expect(screen.getByText("Russia")).toBeInTheDocument();
    expect(screen.getByText("UTC+5")).toBeInTheDocument();
  });
});
