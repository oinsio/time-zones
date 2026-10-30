import { expect } from "vitest";
import { MOVE_BY_KEY_NAME } from "./selectTimeTables";
import type { createTimeSelectionWorld } from "./timeSelectionWorld";

// Implements FR1, FR2 of fix-day-track-handle-overlap-and-end-of-day (shared steps).
const PRECISION = 6;
const QUARTER = 0.75;

/** The step bodies the select-time scenarios share, bound to one world. */
export const createSelectTimeSteps = (
  world: ReturnType<typeof createTimeSelectionWorld>,
) => {
  const givenZone = (_ctx: unknown, zone: string) => world.setDeviceZone(zone);
  const givenInstant = (_ctx: unknown, timestamp: string) =>
    world.setInstant(timestamp);
  const givenList = (_ctx: unknown, cities: string) =>
    world.setStoredCities(cities);
  const givenAppOpen = () => world.open();
  const givenPinnedHere = () =>
    world.selectFraction(world.rows()[0]?.dayTrack?.fraction ?? 0);
  const selectQuarter = () => world.selectFraction(QUARTER);
  const whenKey = (_ctx: unknown, keyName: string) =>
    world.moveTrack(MOVE_BY_KEY_NAME[keyName]);
  const thenPinned = (_ctx: unknown, timestamp: string) => {
    expect(world.isNowShown()).toBe(true);
    expect(world.shownInstant()).toBe(timestamp);
  };
  const thenCardShows = (_ctx: unknown, city: string, time: string) =>
    expect(world.rowOf(city).localTimeLabel).toBe(time);
  const thenEveryHandleAt = (_ctx: unknown, fraction: number) => {
    for (const row of world.rows()) {
      expect(row.dayTrack?.fraction).toBeCloseTo(fraction, PRECISION);
    }
  };
  return {
    givenZone,
    givenInstant,
    givenList,
    givenAppOpen,
    givenPinnedHere,
    selectQuarter,
    whenKey,
    thenPinned,
    thenCardShows,
    thenEveryHandleAt,
  };
};
