import { expect } from "vitest";
import type { createWallTimeWorld } from "./wallTimeWorld";

type WallTimeWorld = ReturnType<typeof createWallTimeWorld>;

/**
 * Step handlers the wall-time input scenarios share; each is bound to the
 * scenario's world.
 * Implements FR3, FR7 of add-wall-time-input-with-hint.
 */
export const createWallTimeStepHandlers = (world: WallTimeWorld) => ({
  givenZone: (_ctx: unknown, zone: string) => world.setDeviceZone(zone),
  givenInstant: (_ctx: unknown, timestamp: string) =>
    world.setInstant(timestamp),
  givenList: (_ctx: unknown, cities: string) => world.setStoredCities(cities),
  givenLanguage: async (_ctx: unknown, language: string) => {
    await world.setLanguage(language);
  },
  givenAppOpen: () => world.open(),
  whenTypes: (_ctx: unknown, text: string, city: string) =>
    world.typeTime(city, text),
  thenPinned: (_ctx: unknown, timestamp: string, status: string) => {
    expect(world.isNowShown()).toBe(true);
    expect(world.pinnedInstant()).toBe(timestamp);
    expect(world.wallClockStatus()).toBe(status);
  },
  thenCardShows: (_ctx: unknown, city: string, time: string) =>
    expect(world.rowOf(city).localTimeLabel).toBe(time),
  thenStillLive: () => expect(world.isNowShown()).toBe(false),
  thenStillPinned: () => expect(world.isNowShown()).toBe(true),
  thenNoHint: () => expect(world.shownHints()).toEqual([]),
  thenNoNote: () => expect(world.hasDateBarNote()).toBe(false),
  givenTypedHint: (_ctx: unknown, text: string, city: string) => {
    world.typeTime(city, text);
    expect(world.hintOfCity(city)).toBeDefined();
  },
});

export type WallTimeStepHandlers = ReturnType<
  typeof createWallTimeStepHandlers
>;
