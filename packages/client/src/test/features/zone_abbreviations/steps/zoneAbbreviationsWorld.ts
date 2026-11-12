// Implements FR1, FR2, FR9 of add-zone-rules-from-iana: helpers of the abbreviation scenarios.
import zoneAbbreviationTable from "virtual:zone-abbreviations";
import { screen } from "@testing-library/react/pure";
import { expect, vi } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getZoneAbbreviation, getZoneAbbreviations } from "@/model";
import abbreviationsBefore from "@/test/zoneRules/fixtures/zone-abbreviations.before.json";
import abbreviationChanges from "@/test/zoneRules/fixtures/zone-abbreviations.changes.json";
import type { createZoneLineWorld } from "../../locations/steps/zoneLineWorld";

export const PAIR_SEPARATOR = ", ";
export const RUSSIAN_LANGUAGE = "ru";
export const ENGLISH_LANGUAGE = "en";
const NEW_YORK_ZONE_ID = "America/New_York";

export const abbreviationAt = (zone: string, instant: string) => {
  try {
    return getZoneAbbreviation(
      zone,
      Temporal.Instant.from(instant).toZonedDateTimeISO(zone),
    );
  } catch (e) {
    if (e instanceof RangeError) return undefined;
    throw e;
  }
};

/** Whether New York's offset is larger at the transition than a second before it. */
export const isNewYorkOffsetRaisedAt = (transition: string): boolean => {
  const transitionInstant = Temporal.Instant.from(transition);
  const before = transitionInstant.subtract({ seconds: 1 });
  return (
    before.toZonedDateTimeISO(NEW_YORK_ZONE_ID).offsetNanoseconds <
    transitionInstant.toZonedDateTimeISO(NEW_YORK_ZONE_ID).offsetNanoseconds
  );
};

/** The abbreviation pairs of the built table for the zones, joined as text. */
export const readTablePairTexts = (zoneIds: string[]) =>
  zoneIds.map((zoneId) => zoneAbbreviationTable[zoneId]?.join(PAIR_SEPARATOR));

export const hasTableEntry = (zoneId: string) =>
  zoneAbbreviationTable[zoneId] !== undefined;

export const countEarlierTableZones = () =>
  Object.keys(abbreviationsBefore).length;

/** Zones whose abbreviations differ between the earlier table and the built one. */
export const findDifferingZoneIds = (): string[] =>
  Object.entries(abbreviationsBefore)
    .filter(
      ([zoneId, abbreviations]) =>
        JSON.stringify(zoneAbbreviationTable[zoneId]) !==
        JSON.stringify(abbreviations),
    )
    .map(([zoneId]) => zoneId);

export const findUnlistedZoneIds = (zoneIds: string[]): string[] =>
  zoneIds.filter((zoneId) => !(zoneId in abbreviationChanges));

export const listChangedZoneIds = (): string[] =>
  Object.keys(abbreviationChanges);

/** Steps of the scenarios that compare the built table with the earlier one. */
export const createTableComparisonSteps = (committedReleaseName: string) => {
  let differingZoneIds: string[] = [];
  return {
    expectBuiltFrom: (_ctx: unknown, releaseName: string) =>
      expect(committedReleaseName).toBe(releaseName),
    expectPairs: (
      _ctx: unknown,
      firstZone: string,
      firstPair: string,
      secondZone: string,
      secondPair: string,
      thirdZone: string,
      thirdPair: string,
    ) =>
      expect(readTablePairTexts([firstZone, secondZone, thirdZone])).toEqual([
        firstPair,
        secondPair,
        thirdPair,
      ]),
    expectNoEntry: (_ctx: unknown, zone: string) =>
      expect(hasTableEntry(zone)).toBe(false),
    expectEarlierTable: () =>
      expect(countEarlierTableZones()).toBeGreaterThan(0),
    compare: () => {
      differingZoneIds = findDifferingZoneIds();
    },
    expectOnlyListedDiffer: () =>
      expect(findUnlistedZoneIds(differingZoneIds)).toEqual([]),
    expectListedDiffer: () => {
      for (const zoneId of listChangedZoneIds()) {
        expect(differingZoneIds).toContain(zoneId);
      }
    },
  };
};

/** Steps of the scenarios that read abbreviations and pairs of a zone. */
export const createReadSteps = () => {
  let readAbbreviations: (string | undefined)[] = [];
  let readPair: readonly string[] = [];
  return {
    reset: () => {
      readAbbreviations = [];
    },
    whenRead: (_ctx: unknown, zone: string, instant: string) => {
      readAbbreviations = [abbreviationAt(zone, instant)];
    },
    whenReadTwice: (
      _ctx: unknown,
      zone: string,
      first: string,
      second: string,
    ) => {
      readAbbreviations = [
        abbreviationAt(zone, first),
        abbreviationAt(zone, second),
      ];
    },
    thenItIs: (_ctx: unknown, expected: string) =>
      expect(readAbbreviations).toEqual([expected]),
    thenItIsThenIs: (_ctx: unknown, first: string, second: string) =>
      expect(readAbbreviations).toEqual([first, second]),
    thenThereIsNone: () => expect(readAbbreviations).toEqual([undefined]),
    whenReadPair: (zone: string) => {
      readPair = getZoneAbbreviations(zone);
    },
    thenPairIs: (expected: string) =>
      expect(readPair.join(PAIR_SEPARATOR)).toBe(expected),
  };
};

/** Steps of the scenarios that show abbreviations in the location list. */
export const createListSteps = (
  world: ReturnType<typeof createZoneLineWorld>,
) => ({
  givenInstant: (_ctx: unknown, instant: string) => world.setInstant(instant),
  givenList: (_ctx: unknown, ...cities: string[]) =>
    world.setList(cities.join(PAIR_SEPARATOR)),
  showList: () => world.open(),
  expectRowShows: (_ctx: unknown, city: string, text: string) =>
    expect(world.zoneLineOf(city)).toContain(text),
  expectTwoRowsShow: (
    _ctx: unknown,
    first: string,
    firstText: string,
    second: string,
    secondText: string,
  ) => {
    expect(world.zoneLineOf(first)).toContain(firstText);
    expect(world.zoneLineOf(second)).toContain(secondText);
  },
});

export const expectNoLoadingState = () => {
  expect(screen.queryByRole("progressbar")).toBeNull();
  expect(document.querySelector("[aria-busy='true']")).toBeNull();
};

export const expectNewYorkClocksForward = (_ctx: unknown, transition: string) =>
  expect(isNewYorkOffsetRaisedAt(transition)).toBe(true);

/** Replaces `fetch` with a spy, so a scenario can prove the table needs no network. */
export const stubFetch = () => {
  const fetchSpy = vi.fn();
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
};
