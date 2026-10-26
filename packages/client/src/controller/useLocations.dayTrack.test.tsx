// Verifies FR1, FR2 of add-time-sliders-to-location-cards (D6).
import { act, renderHook } from "@testing-library/react";
import i18n from "i18next";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider } from "@/controller";
import { LocationsLoadStatus } from "@/ports";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { createSwitchableClock } from "@/test/switchableClock";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { useLocations } from "./useLocations";
import { useTimeSelection } from "./useTimeSelection";

const PRECISION = 6;
const cityRow = (label: string) =>
  buildLocation({ label, ...KNOWN_CITIES[label] });

function setup(startTimestamp: string, deviceTimeZoneId: string) {
  const clock = createSwitchableClock(startTimestamp, deviceTimeZoneId);
  const tickScheduler = createManualTickScheduler();
  const repository = createInMemoryLocationRepository({
    initialDocument: {
      status: LocationsLoadStatus.LOADED,
      locations: [cityRow("Moscow"), cityRow("New York")],
    },
  });
  const rendered = renderHook(
    () => ({ locations: useLocations(), time: useTimeSelection() }),
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
  const fractions = () =>
    rendered.result.current.locations.rows.map((row) => row.dayTrack?.fraction);
  return { ...rendered, clock, tickScheduler, fractions };
}

describe("useLocations day tracks", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(() => i18n.changeLanguage("ru"));

  it("should put every handle at the same live position", () => {
    const { fractions } = setup("2026-03-08T07:30:00Z", "Asia/Almaty");

    for (const fraction of fractions()) {
      expect(fraction).toBeCloseTo(0.520833, PRECISION);
    }
  });

  it("should move a live handle at the minute tick", () => {
    const { clock, tickScheduler, fractions } = setup(
      "2026-07-15T12:00:42.500Z",
      "UTC",
    );

    clock.moveTo("2026-07-15T12:01:00Z");
    act(() => tickScheduler.runPending());

    expect(fractions()[0]).toBeCloseTo(0.500694, PRECISION);
  });

  it("should keep a pinned handle through a tick", () => {
    const { result, clock, tickScheduler, fractions } = setup(
      "2026-03-08T07:30:00Z",
      "Asia/Almaty",
    );
    act(() => result.current.time.selectTrackFraction(0.75));

    clock.moveTo("2026-03-08T07:31:00Z");
    act(() => tickScheduler.runPending());

    expect(fractions()).toEqual([0.75, 0.75]);
  });

  it("should move a live day start past local midnight at the tick", () => {
    const { result, clock, tickScheduler } = setup(
      "2026-03-08T18:59:30Z",
      "Asia/Almaty",
    );
    expect(
      result.current.locations.rows[0]?.dayTrack?.fraction,
    ).toBeGreaterThan(0.99);

    clock.moveTo("2026-03-08T19:00:00Z");
    act(() => tickScheduler.runPending());

    expect(result.current.locations.rows[0]?.dayTrack?.fraction).toBe(0);
  });
});
