// Verifies FR2, FR4, FR5, UX1 of show-here-entry-for-device-time (D5).
// Verifies FR1, FR7 of add-wall-time-input-with-hint (D6).

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WallTimeInputOutcome, WallTimeTargetKind } from "@/controller";
import { LocationMarkKind, type PresentedHereEntry } from "@/presenter";
import { ignoreWallTime } from "@/test/ignoreWallTime";
import { ALMATY_TRACK } from "./dayTrackFixture";
import { HereEntryRow } from "./HereEntryRow";

const almatyEntry: PresentedHereEntry = {
  cityLabel: "Алматы",
  mark: {
    kind: LocationMarkKind.HERE,
    accessibleLabel: "Вы здесь",
    caption: "здесь",
  },
  metaLabel: "Время устройства · UTC+5",
  accessibleName: "Алматы, Вы здесь, Время устройства",
  utcOffsetLabel: "UTC+5",
  offsetDifferenceLabel: "",
  offsetDifferenceAccessibleLabel: "",
  localTimeLabel: "12:30",
  localDateLabel: "вс, 8 мар.",
  localIsoDate: "2026-03-08",
  wallTimeInputLabel: "Ввести время — Алматы, 12:30",
  dayTrack: ALMATY_TRACK,
};

const renderEntry = (
  entry: PresentedHereEntry = almatyEntry,
  onMoveTrack = vi.fn(),
  onConfirmWallTime = ignoreWallTime,
) =>
  render(
    <HereEntryRow
      entry={entry}
      onSelectTrackFraction={vi.fn()}
      onMoveTrack={onMoveTrack}
      onConfirmWallTime={onConfirmWallTime}
    />,
  );

describe("HereEntryRow", () => {
  it("should be a region named for assistive technology", () => {
    renderEntry();

    expect(
      screen.getByRole("region", {
        name: "Алматы, Вы здесь, Время устройства",
      }),
    ).toBeInTheDocument();
  });

  it.each([
    "Алматы",
    "здесь",
    "Время устройства · UTC+5",
    "12:30",
    "вс, 8 мар.",
  ])("should show %s", (text) => {
    renderEntry();

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("should show the Here mark image", () => {
    renderEntry();

    expect(screen.getByRole("img", { name: "Вы здесь" })).toBeInTheDocument();
  });

  it("should offer no drag handle, menu or remove action", () => {
    renderEntry();

    expect(
      screen.getAllByRole("button").map((button) => button.textContent),
    ).toEqual(["12:30"]);
  });

  it("should show the offset difference of a travelling user", () => {
    renderEntry({
      ...almatyEntry,
      offsetDifferenceLabel: "−2 ч",
      offsetDifferenceAccessibleLabel: "на 2 часа меньше",
    });

    expect(screen.getByText("−2 ч")).toBeInTheDocument();
  });

  it("should give its slider the city name and hand key moves on", () => {
    const onMoveTrack = vi.fn();
    renderEntry(almatyEntry, onMoveTrack);

    const slider = screen.getByRole("slider", { name: "Время — Алматы" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });

    expect(onMoveTrack).toHaveBeenCalledTimes(1);
  });

  it("should keep the city on one line", () => {
    renderEntry();

    expect(screen.getByText("Алматы")).toHaveClass("truncate");
  });

  it("should confirm a typed time with the Here entry target", async () => {
    const onConfirmWallTime = vi.fn(() => WallTimeInputOutcome.CLOSED);
    renderEntry(almatyEntry, vi.fn(), onConfirmWallTime);

    await userEvent.click(
      screen.getByRole("button", { name: almatyEntry.wallTimeInputLabel }),
    );
    await userEvent.type(screen.getByRole("textbox"), "{Enter}");

    expect(onConfirmWallTime).toHaveBeenCalledWith(
      { kind: WallTimeTargetKind.HERE_ENTRY },
      "12:30",
      "2026-03-08",
    );
  });

  it("should show the wall-time hint under the place column", () => {
    renderEntry({ ...almatyEntry, wallTimeHint: "02:30 не существует" });

    expect(screen.getByRole("status")).toHaveTextContent("02:30 не существует");
  });

  it("should show no hint without one", () => {
    renderEntry();

    expect(screen.queryByRole("status")).toBeNull();
  });
});
