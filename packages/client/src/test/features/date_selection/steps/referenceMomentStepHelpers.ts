import userEvent from "@testing-library/user-event";
import { expect } from "vitest";
import { isNowInactive, nowButtonOfBar } from "./dateSelectionQueries";
import type { createDateSelectionWorld } from "./dateSelectionWorld";

type DateSelectionWorld = ReturnType<typeof createDateSelectionWorld>;

type RowTable = { city: string; time: string; date: string }[];

/**
 * Step handlers shared by the reference-moment feature files.
 * Implements FR1, FR2, FR5, FR6 of select-date-with-calendar-and-now.
 */
export function createReferenceMomentSteps(world: DateSelectionWorld) {
  return {
    givenZone: (_ctx: unknown, zone: string) => world.setDeviceZone(zone),
    givenInstant: (_ctx: unknown, timestamp: string) =>
      world.setInstant(timestamp),
    givenList: (_ctx: unknown, cities: string) => world.setStoredCities(cities),
    givenAppOpen: () => world.openApp(),
    givenMovedToNextDay: () => world.showNextDay(),
    whenOpens: () => world.openApp(),
    whenActivatesInactiveNow: () =>
      userEvent.click(nowButtonOfBar() as HTMLElement),
    whenNextDay: () => world.showNextDay(),
    whenPreviousDay: () => world.showPreviousDay(),
    thenLive: () => world.expectLive(),
    thenPinned: (_ctx: unknown, timestamp: string) =>
      world.expectPinnedTo(timestamp),
    thenRowShows: (_ctx: unknown, city: string, time: string, date: string) =>
      world.expectRowShows(city, time, date),
    thenRowsShow: (_ctx: unknown, table: RowTable) => {
      for (const { city, time, date } of table) {
        world.expectRowShows(city, time, date);
      }
    },
    thenOffset: (_ctx: unknown, city: string, offset: string) =>
      world.expectRowOffset(city, offset),
    thenNowInactive: () => expect(isNowInactive()).toBe(true),
    thenNowActive: () => expect(world.isNowActive()).toBe(true),
    whenNextMinute: async (_ctx: unknown, timestamp: string) => {
      world.setInstant(timestamp);
      await world.runTick();
    },
  };
}
