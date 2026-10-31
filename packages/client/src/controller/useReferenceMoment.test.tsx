// Verifies FR1, FR2, FR3, FR4, FR6, FR7 of select-date-with-calendar-and-now (D5).

import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { DEVICE_TIME_LOCATION_ID } from "@/constants";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { createManualWriteScheduler } from "@/test/writeSchedulers";
import { LocationsProvider } from "./LocationsProvider";
import { useReferenceMoment } from "./useReferenceMoment";
import { useWallTimeInput, WallTimeTargetKind } from "./useWallTimeInput";

const GAP_NOTE_EN =
  "02:30 does not exist on this day because of a clock change; showing 03:30.";

function setup(timestamp: string, zone: string) {
  const clock = createSwitchableClock(timestamp, zone);
  const tickScheduler = createManualTickScheduler();
  const writeScheduler = createManualWriteScheduler();
  const rendered = renderHook(() => useReferenceMoment(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <LocationsProvider
        repository={createInMemoryLocationRepository()}
        writeScheduler={writeScheduler}
        clock={clock}
        tickScheduler={tickScheduler}
      >
        {children}
      </LocationsProvider>
    ),
  });
  return { ...rendered, clock, tickScheduler, writeScheduler };
}

const almatyMarch8 = () => setup("2026-03-08T07:30:00Z", "Asia/Almaty");

describe("useReferenceMoment", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should open live without a note", () => {
    const { result } = almatyMarch8();

    expect(result.current.dateBar.isPinned).toBe(false);
    expect(result.current.dateBar.gapNote).toBeUndefined();
    expect(result.current.dateBar.isoDate).toBe("2026-03-08");
  });

  it("should pin the next day", () => {
    const { result } = almatyMarch8();

    act(() => result.current.showNextDay());

    expect(result.current.dateBar.isPinned).toBe(true);
    expect(result.current.dateBar.isoDate).toBe("2026-03-09");
  });

  it("should pin the previous day", () => {
    const { result } = almatyMarch8();

    act(() => result.current.showPreviousDay());

    expect(result.current.dateBar.isoDate).toBe("2026-03-07");
  });

  it("should pin a selected date", () => {
    const { result } = almatyMarch8();

    act(() => result.current.selectDate("2026-07-15"));

    expect(result.current.dateBar.isoDate).toBe("2026-07-15");
  });

  it("should stay live when the shown date is selected", () => {
    const { result } = almatyMarch8();

    act(() => result.current.selectDate("2026-03-08"));

    expect(result.current.dateBar.isPinned).toBe(false);
  });

  it("should stay live when the selected date is malformed", () => {
    const { result } = almatyMarch8();

    act(() => result.current.selectDate("2026-13-01"));

    expect(result.current.dateBar.isPinned).toBe(false);
  });

  it("should return to now", () => {
    const { result } = almatyMarch8();
    act(() => result.current.showNextDay());

    act(() => result.current.returnToNow());

    expect(result.current.dateBar.isPinned).toBe(false);
    expect(result.current.dateBar.isoDate).toBe("2026-03-08");
  });

  it("should tell a gap once and clear it on the next move", () => {
    const { result } = setup("2026-03-07T07:30:00Z", "America/New_York");

    act(() => result.current.showNextDay());
    expect(result.current.dateBar.gapNote).toBe(GAP_NOTE_EN);

    act(() => result.current.showNextDay());
    expect(result.current.dateBar.gapNote).toBeUndefined();
  });

  it("should tell no note on an ambiguous wall time", () => {
    const { result } = setup("2026-10-31T05:30:00Z", "America/New_York");

    act(() => result.current.showNextDay());

    expect(result.current.dateBar.isoDate).toBe("2026-11-01");
    expect(result.current.dateBar.gapNote).toBeUndefined();
  });

  it("should announce the full date after a change only", () => {
    const { result } = almatyMarch8();
    expect(result.current.announcement).toBe("");

    act(() => result.current.showNextDay());

    expect(result.current.announcement).toBe("Monday, March 9, 2026");
  });

  it("should follow the clock past local midnight while live", () => {
    const { result, clock, tickScheduler } = setup(
      "2026-03-08T18:59:30Z",
      "Asia/Almaty",
    );
    expect(result.current.dateBar.isoDate).toBe("2026-03-08");

    clock.moveTo("2026-03-08T19:00:00Z");
    act(() => tickScheduler.runPending());

    expect(result.current.dateBar.isoDate).toBe("2026-03-09");
    expect(result.current.announcement).toBe("");
  });

  it("should announce nothing when the shown date is selected", () => {
    const { result } = almatyMarch8();

    act(() => result.current.selectDate("2026-03-08"));

    expect(result.current.announcement).toBe("");
  });

  it("should announce nothing when the selected date is malformed", () => {
    const { result } = almatyMarch8();

    act(() => result.current.selectDate("2026-13-01"));

    expect(result.current.announcement).toBe("");
  });

  it("should announce in the language the interface switched to", async () => {
    const { result } = almatyMarch8();
    await act(() => i18n.changeLanguage("ru"));

    act(() => result.current.showNextDay());

    expect(result.current.announcement).toBe("понедельник, 9 марта 2026 г.");
  });

  it("should throw outside a LocationsProvider", () => {
    expect(() => renderHook(() => useReferenceMoment())).toThrow(
      "useReferenceMoment must be used inside a LocationsProvider",
    );
  });

  it("should write nothing for date actions", () => {
    const { result, writeScheduler } = almatyMarch8();

    act(() => {
      for (let move = 0; move < 5; move++) result.current.showNextDay();
      for (let move = 0; move < 5; move++) result.current.showPreviousDay();
      result.current.returnToNow();
    });

    expect(writeScheduler.lastDelayMs()).toBeUndefined();
  });
});

// Verifies FR7 of add-wall-time-input-with-hint (D2).
const deviceTimeTarget = {
  kind: WallTimeTargetKind.LOCATION,
  locationId: DEVICE_TIME_LOCATION_ID,
} as const;

describe("useReferenceMoment and a wall-time input", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  function setupWithWallTime() {
    const clock = createSwitchableClock(
      "2026-03-07T07:30:00Z",
      "America/New_York",
    );
    return renderHook(
      () => ({ reference: useReferenceMoment(), wallTime: useWallTimeInput() }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <LocationsProvider
            repository={createInMemoryLocationRepository()}
            writeScheduler={createManualWriteScheduler()}
            clock={clock}
            tickScheduler={createManualTickScheduler()}
          >
            {children}
          </LocationsProvider>
        ),
      },
    );
  }

  it("ends the gap note of a date change", () => {
    const { result } = setupWithWallTime();
    act(() => result.current.reference.showNextDay());
    expect(result.current.reference.dateBar.gapNote).toBe(GAP_NOTE_EN);

    act(() => {
      result.current.wallTime.confirmWallTime(
        deviceTimeTarget,
        "10:00",
        "2026-03-08",
      );
    });

    expect(result.current.reference.dateBar.gapNote).toBeUndefined();
  });

  it("shows no gap note for a wall-time GAP", () => {
    const { result } = setupWithWallTime();

    act(() => {
      result.current.wallTime.confirmWallTime(
        deviceTimeTarget,
        "02:30",
        "2026-03-08",
      );
    });

    expect(result.current.reference.dateBar.isoDate).toBe("2026-03-08");
    expect(result.current.reference.dateBar.gapNote).toBeUndefined();
  });
});
