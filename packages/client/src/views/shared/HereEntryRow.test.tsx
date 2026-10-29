// Verifies FR2, FR4, FR5, UX1 of show-here-entry-for-device-time (D5).
import { fireEvent, render, screen } from "@testing-library/react";
import { LocationMarkKind, type PresentedHereEntry } from "@/presenter";
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
  dayTrack: ALMATY_TRACK,
};

const renderEntry = (
  entry: PresentedHereEntry = almatyEntry,
  onMoveTrack = vi.fn(),
) =>
  render(
    <HereEntryRow
      entry={entry}
      onSelectTrackFraction={vi.fn()}
      onMoveTrack={onMoveTrack}
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

    expect(screen.queryAllByRole("button")).toEqual([]);
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
});
