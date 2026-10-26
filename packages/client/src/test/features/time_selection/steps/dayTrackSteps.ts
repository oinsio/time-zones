// Implements FR1, FR2 of add-time-sliders-to-location-cards: shared step bodies of the day track scenarios.
import { expect } from "vitest";
import { buildLocation } from "@/test/factories/buildLocation";
import { cityEntry } from "../../locations/steps/locationsUiWorld";
import type { createTimeSelectionWorld } from "./timeSelectionWorld";

const PRECISION = 6;
export const UNKNOWN_ZONE_LABEL = "Olympus Mons";

export const createDayTrackSteps = (
  world: ReturnType<typeof createTimeSelectionWorld>,
) => ({
  givenZone: (_ctx: unknown, zone: string) => world.setDeviceZone(zone),
  givenInstant: (_ctx: unknown, timestamp: string) =>
    world.setInstant(timestamp),
  givenList: (_ctx: unknown, cities: string) => world.setStoredCities(cities),
  givenAppOpen: () => world.open(),
  givenMoscowAndUnknownZone: () =>
    world.setStoredLocations([
      buildLocation(cityEntry("Moscow")),
      buildLocation({
        label: UNKNOWN_ZONE_LABEL,
        timeZoneId: "Mars/Olympus_Mons",
        countryCode: "",
      }),
    ]),
  givenPinnedHere: () =>
    world.selectFraction(world.rows()[0]?.dayTrack?.fraction ?? 0),
  whenNextMinute: (_ctx: unknown, timestamp: string) => {
    world.clock().moveTo(timestamp);
    world.runTick();
  },
  thenEveryHandleAt: (_ctx: unknown, fraction: number) => {
    for (const row of world.rows()) {
      expect(row.dayTrack?.fraction).toBeCloseTo(fraction, PRECISION);
    }
  },
});
