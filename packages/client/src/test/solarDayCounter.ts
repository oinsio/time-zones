// Implements NFR-P1, NFR-P3 of bind-day-periods-to-sun (D5).
// Counts the sun computations our code asks for. The sun module uses neither
// `Intl` nor Temporal, so there is no platform API to spy on: the test file
// wraps the module instead, with this line at its top level:
//
//   vi.mock("@/model/sun", async (importOriginal) =>
//     (await import("@/test/solarDayCounter")).countSunCalls(await importOriginal()));
//
// The setup file has already evaluated the model barrel by the time a test
// file registers the mock, so the modules under test are loaded afresh with
// `importWithSunCount`. The counts live on `globalThis` because that reload
// also gives the factory a new instance of this file.
import { vi } from "vitest";
import type * as SunModule from "@/model/sun";

type ActualSunModule = typeof SunModule;

export type SolarDayCount = {
  solarDays(): number;
  elevations(): number;
  stop(): void;
};

export const MISSING_SUN_MOCK_MESSAGE =
  'startSolarDayCount needs the sun module wrapped in this test file: add vi.mock("@/model/sun", async (importOriginal) => (await import("@/test/solarDayCounter")).countSunCalls(await importOriginal())) and load the modules with importWithSunCount';

type CounterState = {
  isWrapped: boolean;
  isCounting: boolean;
  solarDayCalls: number;
  elevationCalls: number;
};

const COUNTER_STATE_KEY = Symbol.for("time-zones.solarDayCounter");
const globalWithState = globalThis as unknown as Record<symbol, CounterState>;
const state: CounterState = (globalWithState[COUNTER_STATE_KEY] ??= {
  isWrapped: false,
  isCounting: false,
  solarDayCalls: 0,
  elevationCalls: 0,
});

/** The sun module with `getSolarDay` and `getSunElevation` counting their calls. */
export function countSunCalls(actualSunModule: ActualSunModule) {
  state.isWrapped = true;
  return {
    ...actualSunModule,
    getSolarDay: (
      ...parameters: Parameters<ActualSunModule["getSolarDay"]>
    ) => {
      if (state.isCounting) state.solarDayCalls += 1;
      return actualSunModule.getSolarDay(...parameters);
    },
    getSunElevation: (
      ...parameters: Parameters<ActualSunModule["getSunElevation"]>
    ) => {
      if (state.isCounting) state.elevationCalls += 1;
      return actualSunModule.getSunElevation(...parameters);
    },
  };
}

/** Loads modules afresh so that they bind to the wrapped sun module, and loads their sun support. */
export async function importWithSunCount<T>(
  load: () => Promise<T>,
): Promise<T> {
  vi.resetModules();
  await (await import("@/model/sunRegistry")).loadSunSupport();
  return load();
}

/** Counts the calls from now until `stop()`. Throws when the module is not wrapped. */
export function startSolarDayCount(): SolarDayCount {
  if (!state.isWrapped) throw new Error(MISSING_SUN_MOCK_MESSAGE);
  state.solarDayCalls = 0;
  state.elevationCalls = 0;
  state.isCounting = true;
  return {
    solarDays: () => state.solarDayCalls,
    elevations: () => state.elevationCalls,
    stop: () => {
      state.isCounting = false;
    },
  };
}
