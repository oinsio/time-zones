// Verifies FR8, FR9, FR10 of apply-data-updates-silently: the fixtures of the watched zone scenarios.

import { parseFutureRule, type ZoneRules } from "@/lib/zoneRules";
import { INITIAL_WORLD_CLOCK_STATE, type WorldClockState } from "@/model";
import { buildLocation } from "@/test/factories/buildLocation";
import {
  changesWith,
  createZone,
  IN_FORCE_INDEX,
  instantSeconds,
  LATER_INDEX,
  PAST_INDEX,
  releaseOf,
  SUMMER,
  WINTER,
} from "@/test/zoneRules/lisbonLikeZone";

export const LISBON = "Europe/Lisbon";
export const COMPARISON_INSTANT = "2026-11-15T12:00:00Z";
export const COMPARISON_SECONDS = instantSeconds(COMPARISON_INSTANT);

export const stateOf = (
  zoneIds: string[],
  deviceTimeZoneId: string,
): WorldClockState => ({
  ...INITIAL_WORLD_CLOCK_STATE,
  locations: zoneIds.map((timeZoneId, index) =>
    buildLocation({ timeZoneId, label: `City ${index}` }),
  ),
  deviceTimeZoneId,
});

/** The stored rules of Lisbon for each kind of difference, by the words of the scenario. */
export const LISBON_DIFFERENCES: Record<string, ZoneRules> = {
  "the UTC offset in force at the comparison instant": createZone({
    changes: changesWith(IN_FORCE_INDEX, {
      localTimeType: { ...WINTER, utcOffsetSeconds: 1800 },
    }),
  }),
  "the designation in force at the comparison instant": createZone({
    changes: changesWith(IN_FORCE_INDEX, {
      localTimeType: { ...WINTER, designation: "GMT" },
    }),
  }),
  "the daylight-saving flag in force at the comparison instant, with the same UTC offset and designation":
    createZone({
      changes: changesWith(IN_FORCE_INDEX, {
        localTimeType: { ...WINTER, isDaylightSavingTime: true },
      }),
    }),
  "the instant of the clock change of March 2027": createZone({
    changes: changesWith(LATER_INDEX, {
      epochSeconds: instantSeconds("2027-03-29T01:00:00Z"),
    }),
  }),
  "the UTC offset that the clock change of March 2027 starts": createZone({
    changes: changesWith(LATER_INDEX, {
      localTimeType: { ...SUMMER, utcOffsetSeconds: 7200 },
    }),
  }),
  "the rule for the years after the listed clock changes": createZone({
    futureRule: parseFutureRule("WET0WEST,M3.4.0/1,M10.5.0"),
  }),
};

/** The zones of the stored release for each difference that does not count. */
export const NON_COUNTING_DIFFERENCES: Record<
  string,
  Record<string, ZoneRules>
> = {
  'a clock change of "Europe/Lisbon" in 2009': {
    [LISBON]: createZone({
      changes: changesWith(PAST_INDEX, {
        epochSeconds: instantSeconds("2009-03-28T01:00:00Z"),
      }),
    }),
  },
  'the rules of "America/Asuncion"': {
    [LISBON]: createZone(),
    "America/Asuncion": createZone({ futureRule: undefined }),
  },
  'a new zone "America/Example" that the active release does not hold': {
    [LISBON]: createZone(),
    "America/Example": createZone(),
  },
};

export const releaseWith = releaseOf;
