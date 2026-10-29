// Verifies FR3, FR4, FR5, FR8 of add-time-sliders-to-location-cards (D6).
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider, TrackMove } from "@/controller";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { useLocations } from "./useLocations";
import { useReferenceMoment } from "./useReferenceMoment";
import { useTimeSelection } from "./useTimeSelection";

const SELECTION_COUNT = 20;
const cityRow = (label: string) =>
  buildLocation({ label, ...KNOWN_CITIES[label] });

function setup(startTimestamp: string, deviceTimeZoneId: string) {
  const clock = createSwitchableClock(startTimestamp, deviceTimeZoneId);
  const writeScheduler = createManualWriteScheduler();
  const repository = createInMemoryLocationRepository({
    initialDocument: {
      status: LocationsLoadStatus.LOADED,
      locations: [cityRow("Almaty"), cityRow("New York")],
      homeLocationId: null,
    },
  });
  const rendered = renderHook(
    () => ({
      locations: useLocations(),
      reference: useReferenceMoment(),
      time: useTimeSelection(),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocationsProvider
          repository={repository}
          writeScheduler={writeScheduler}
          clock={clock}
          tickScheduler={createManualTickScheduler()}
        >
          {children}
        </LocationsProvider>
      ),
    },
  );
  const rowOf = (label: string) =>
    rendered.result.current.locations.rows.find(
      (row) => row.cityLabel === label,
    );
  return { ...rendered, writeScheduler, rowOf };
}

describe("useTimeSelection", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should show the selected position on every card and pin the moment", () => {
    const { result, rowOf } = setup("2026-03-08T07:30:00Z", "Asia/Almaty");

    act(() => result.current.time.selectTrackFraction(0.75));

    expect(rowOf("New York")?.localTimeLabel).toBe("09:00");
    expect(rowOf("New York")?.utcOffsetLabel).toBe("UTC−4");
    expect(result.current.reference.dateBar.isPinned).toBe(true);
  });

  it("should move by hours and steps from a live moment", () => {
    const { result, rowOf } = setup("2026-03-08T07:30:00Z", "Asia/Almaty");

    act(() => result.current.time.moveTrack(TrackMove.HOUR_FORWARD));
    act(() => result.current.time.moveTrack(TrackMove.HOUR_FORWARD));
    act(() => result.current.time.moveTrack(TrackMove.NEXT_STEP));

    expect(rowOf("Almaty")?.localTimeLabel).toBe("14:45");
  });

  it("should end the gap note with a move", () => {
    const { result } = setup("2026-03-07T07:30:00Z", "America/New_York");
    act(() => result.current.reference.showNextDay());
    expect(result.current.reference.dateBar.gapNote).toBeDefined();

    act(() => result.current.time.moveTrack(TrackMove.NEXT_STEP));

    expect(result.current.reference.dateBar.gapNote).toBeUndefined();
  });

  it("should follow the clock again after returning to now", () => {
    const { result, rowOf } = setup("2026-03-08T07:30:00Z", "Asia/Almaty");
    act(() => result.current.time.selectTrackFraction(0.75));

    act(() => result.current.reference.returnToNow());

    expect(rowOf("Almaty")?.dayTrack?.fraction).toBeCloseTo(0.520833, 6);
    expect(result.current.reference.dateBar.isPinned).toBe(false);
  });

  it("should store nothing for time selections", () => {
    const { result, writeScheduler } = setup(
      "2026-03-08T07:30:00Z",
      "Asia/Almaty",
    );

    for (let step = 0; step < SELECTION_COUNT; step++) {
      act(() =>
        result.current.time.selectTrackFraction(step / SELECTION_COUNT),
      );
    }
    act(() => result.current.reference.returnToNow());

    expect(writeScheduler.lastDelayMs()).toBeUndefined();
  });
});

describe("useTimeSelection outside and inside providers", () => {
  it("should refuse to work outside a LocationsProvider", () => {
    expect(() => renderHook(() => useTimeSelection())).toThrow(
      "useTimeSelection must be used inside a LocationsProvider",
    );
  });
});
