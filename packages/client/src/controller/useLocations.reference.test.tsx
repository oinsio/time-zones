// Verifies FR5, FR6 of select-date-with-calendar-and-now (D5).
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationsProvider } from "./LocationsProvider";
import { useLocations } from "./useLocations";
import { useReferenceMoment } from "./useReferenceMoment";

const newYork = buildLocation({
  label: "New York",
  ...KNOWN_CITIES["New York"],
});

function setup() {
  const clock = createSwitchableClock("2026-03-08T07:30:00Z", "Asia/Almaty");
  const tickScheduler = createManualTickScheduler();
  const repository = createInMemoryLocationRepository({
    initialDocument: {
      status: LocationsLoadStatus.LOADED,
      locations: [newYork],
      homeLocationId: null,
    },
  });
  const rendered = renderHook(
    () => ({ locations: useLocations(), reference: useReferenceMoment() }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <LocationsProvider
          repository={repository}
          writeScheduler={immediateWriteScheduler}
          clock={clock}
          tickScheduler={tickScheduler}
        >
          {children}
        </LocationsProvider>
      ),
    },
  );
  const newYorkRow = () => rendered.result.current.locations.rows[0];
  return { ...rendered, clock, tickScheduler, newYorkRow };
}

describe("useLocations at a reference moment", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should show the next day's time and offset", () => {
    const { result, newYorkRow } = setup();

    act(() => result.current.reference.showNextDay());

    expect(newYorkRow()?.localTimeLabel).toBe("03:30");
    expect(newYorkRow()?.utcOffsetLabel).toBe("UTC−4");
  });

  it("should show the previous day's time and offset", () => {
    const { result, newYorkRow } = setup();

    act(() => result.current.reference.showPreviousDay());

    expect(newYorkRow()?.localTimeLabel).toBe("02:30");
    expect(newYorkRow()?.utcOffsetLabel).toBe("UTC−5");
  });

  it("should keep a pinned row through a minute tick", () => {
    const { result, clock, tickScheduler, newYorkRow } = setup();
    act(() => result.current.reference.showNextDay());

    clock.moveTo("2026-03-08T07:31:00Z");
    act(() => tickScheduler.runPending());

    expect(newYorkRow()?.localTimeLabel).toBe("03:30");
  });

  it("should follow the clock again after returning to now", () => {
    const { result, clock, newYorkRow } = setup();
    act(() => result.current.reference.showNextDay());

    clock.moveTo("2026-03-08T07:31:00Z");
    act(() => result.current.reference.returnToNow());

    expect(newYorkRow()?.localTimeLabel).toBe("03:31");
  });
});
