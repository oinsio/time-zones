// Verifies FR3, FR12, FR13, NFR-P1 of add-day-colouring-setting.
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import {
  createInMemoryLocationRepository,
  createInMemoryPreferencesRepository,
} from "@/adapters";
import { LocationsLoadStatus } from "@/ports";
import { DayColouring } from "@/preferences";
import { DayColour, HourFrameColour } from "@/presenter";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import {
  createManualWriteScheduler,
  immediateWriteScheduler,
} from "@/test/writeSchedulers";
import { LocationsProvider } from "./LocationsProvider";
import { PreferencesProvider } from "./PreferencesProvider";
import { useHourGrid } from "./useHourGrid";
import { useLocations } from "./useLocations";
import { usePreferences } from "./usePreferences";

const MONDAY_TIMESTAMP = "2026-03-09T06:00:00Z";
const NEXT_MINUTE_TIMESTAMP = "2026-03-09T06:01:00Z";

function setup() {
  const clock = createSwitchableClock(MONDAY_TIMESTAMP, "Asia/Almaty");
  const tickScheduler = createManualTickScheduler();
  const repository = createInMemoryLocationRepository({
    initialDocument: {
      status: LocationsLoadStatus.LOADED,
      locations: [
        buildLocation({ label: "Almaty", ...KNOWN_CITIES.Almaty }),
        buildLocation({ label: "Moscow", ...KNOWN_CITIES.Moscow }),
      ],
      homeLocationId: null,
    },
  });
  const rendered = renderHook(
    () => ({
      locations: useLocations(),
      grid: useHourGrid(),
      preferences: usePreferences(),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <PreferencesProvider
          repository={createInMemoryPreferencesRepository()}
          writeScheduler={createManualWriteScheduler()}
        >
          <LocationsProvider
            repository={repository}
            writeScheduler={immediateWriteScheduler}
            clock={clock}
            tickScheduler={tickScheduler}
          >
            {children}
          </LocationsProvider>
        </PreferencesProvider>
      ),
    },
  );
  const chooseColouring = (dayColouring: DayColouring) =>
    act(() =>
      rendered.result.current.preferences.setDayColouring(dayColouring),
    );
  const tick = () => {
    clock.moveTo(NEXT_MINUTE_TIMESTAMP);
    act(() => tickScheduler.runPending());
  };
  return { ...rendered, chooseColouring, tick };
}

const stopColoursOf = (result: ReturnType<typeof setup>["result"]) =>
  result.current.locations.rows[0].dayTrack?.stops.map((stop) => stop.colour);

describe("the day colouring in the controller", () => {
  it("should present Time of day colours by default", () => {
    const { result } = setup();
    expect(stopColoursOf(result)?.[0]).toBe(DayColour.NIGHT);
  });

  it("should re-present the rows at once after a colouring change", () => {
    const { result, chooseColouring } = setup();
    chooseColouring(DayColouring.PLAIN);
    expect(stopColoursOf(result)).toEqual([DayColour.PLAIN]);
  });

  it("should re-present the hour strips after a colouring change", () => {
    const { result, chooseColouring } = setup();
    chooseColouring(DayColouring.PLAIN);
    const [firstStrip] = [...result.current.grid.strips.values()];
    expect(
      firstStrip.cells.every((cell) => cell.dayColour === DayColour.PLAIN),
    ).toBe(true);
  });

  it("should give the hour frame the accent in Time of day and the foreground otherwise", () => {
    const { result, chooseColouring } = setup();
    expect(result.current.grid.hourFrameColour).toBe(HourFrameColour.ACCENT);
    chooseColouring(DayColouring.WORKING_HOURS);
    expect(result.current.grid.hourFrameColour).toBe(
      HourFrameColour.FOREGROUND,
    );
  });

  it("should return the same stops and strip after a minute tick in Working hours", () => {
    const { result, chooseColouring, tick } = setup();
    chooseColouring(DayColouring.WORKING_HOURS);
    const stopsBefore = result.current.locations.rows[0].dayTrack?.stops;
    const stripBefore = result.current.grid.strips.get(
      result.current.locations.rows[0].id,
    );
    tick();
    expect(result.current.locations.rows[0].dayTrack?.stops).toBe(stopsBefore);
    expect(
      result.current.grid.strips.get(result.current.locations.rows[0].id),
    ).toBe(stripBefore);
  });

  it("should re-present when the working hours change", () => {
    const { result } = setup();
    act(() =>
      result.current.preferences.setDayColouring(DayColouring.WORKING_HOURS),
    );
    const stopsBefore = result.current.locations.rows[0].dayTrack?.stops;
    act(() =>
      result.current.preferences.setWorkingHours({
        start: "09:07",
        end: "18:00",
      }),
    );
    expect(result.current.locations.rows[0].dayTrack?.stops).not.toBe(
      stopsBefore,
    );
  });
});
