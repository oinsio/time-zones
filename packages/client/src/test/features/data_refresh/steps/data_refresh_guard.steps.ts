// Verifies FR2, FR7, M3 of refresh-data-through-scheduled-pull-requests: the refresh guard.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import type { CityDataset } from "../../../../../scripts/cityData/cityDataTypes.ts";
import { compareCityData } from "../../../../../scripts/dataRefresh/compareCityData.ts";
import { compareZoneRules } from "../../../../../scripts/dataRefresh/compareZoneRules.ts";
import {
  decideCityDataRefresh,
  decideZoneRulesRefresh,
  type RefreshDecision,
} from "../../../../../scripts/dataRefresh/refreshVerdict.ts";

import {
  ALMATY_CITY_ID,
  buildCities,
  buildCommittedCities,
  buildDataset,
  COMMITTED_CITY_COUNT,
  LARGE_CITY_ID,
  releaseOf,
} from "./data_refresh_guard.fixtures.ts";

const feature = await loadFeature("../data_refresh_guard.feature");

const REASON_FRAGMENTS: Record<string, string> = {
  "the count and the share": "committed cities are missing",
  "the city": "inhabitants is missing",
  "the zone": "No city uses the zone Asia/Almaty",
};

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let committed: CityDataset;
  let refreshed: CityDataset;
  let cityDecision: RefreshDecision;
  let zoneRulesDecision: RefreshDecision;
  let committedZoneIds: string[] = [];
  let committedCoordinateIds: string[] = [];

  // @refresh-data-through-scheduled-pull-requests @FR2
  f.Scenario(
    "Nothing but the dump date changed",
    ({ Given, And, When, Then }) => {
      Given(
        "the committed city data was compiled from the dump of {string}",
        (_ctx, dumpDate: string) => {
          committed = buildDataset(buildCommittedCities(), dumpDate);
        },
      );
      And(
        "the dump of {string} gives the same cities, names, zones, regions, populations and coordinates",
        (_ctx, dumpDate: string) => {
          refreshed = buildDataset(buildCommittedCities(), dumpDate);
        },
      );
      When(
        "the city data refresh is compared with the committed city data",
        () => {
          cityDecision = decideCityDataRefresh(
            compareCityData(committed, refreshed),
          );
        },
      );
      Then("the verdict is {string}", (_ctx, verdict: string) => {
        expect(cityDecision.verdict).toBe(verdict);
      });
    },
  );

  // @refresh-data-through-scheduled-pull-requests @FR2
  f.Scenario("Only the dump date differs", ({ Given, When, Then }) => {
    let isSameData = false;
    Given(
      "two compiled files with the dump dates {string} and {string} and the same cities",
      (_ctx, committedDate: string, refreshedDate: string) => {
        committed = buildDataset(buildCommittedCities(), committedDate);
        refreshed = buildDataset(buildCommittedCities(), refreshedDate);
      },
    );
    When("they are compared for a refresh", () => {
      isSameData = compareCityData(committed, refreshed).isSameData;
    });
    Then("they hold the same city data", () => {
      expect(isSameData).toBe(true);
    });
  });

  // @refresh-data-through-scheduled-pull-requests @FR7
  f.ScenarioOutline(
    "The guard decides",
    ({ Given, When, Then, And }, variables) => {
      Given(
        "the committed city data holds {int} cities",
        (_ctx, count: number) => {
          expect(count).toBe(COMMITTED_CITY_COUNT);
          committed = buildDataset(buildCommittedCities(), "2026-11-14");
        },
      );
      When(
        'a refresh lacks "<lost>" cities, "<largeLost>" large city and "<zoneLost>" zone, and adds "<added>" cities',
        () => {
          const lostCount = Number(variables.lost);
          const lostIds = new Set(
            Array.from({ length: lostCount }, (_, index) => index + 1),
          );
          if (variables.largeLost === "yes") lostIds.add(LARGE_CITY_ID);
          if (variables.zoneLost === "yes") lostIds.add(ALMATY_CITY_ID);
          const kept = committed.cities.filter(
            (city) => !lostIds.has(Number(city[0])),
          );
          const added = buildCities(
            Number(variables.added),
            COMMITTED_CITY_COUNT + 1,
          );
          refreshed = buildDataset([...kept, ...added], "2026-12-02");
          cityDecision = decideCityDataRefresh(
            compareCityData(committed, refreshed),
          );
        },
      );
      Then('the verdict is "<verdict>"', () => {
        expect(cityDecision.verdict).toBe(variables.verdict);
      });
      And('the reasons are "<reasons>"', () => {
        const fragment = REASON_FRAGMENTS[String(variables.reasons)];
        if (fragment === undefined) {
          expect(cityDecision.reasons).toEqual([]);
        } else {
          expect(cityDecision.reasons.join("\n")).toContain(fragment);
        }
      });
    },
  );

  // @refresh-data-through-scheduled-pull-requests @FR7
  f.Scenario("Zone rules that lose a zone", ({ Given, When, Then }) => {
    Given(
      "the committed release holds the identifier {string}",
      (_ctx, zoneId: string) => {
        committedZoneIds = [zoneId];
      },
    );
    When(
      "the refreshed release has no entry {string}, neither a zone nor a link",
      () => {
        zoneRulesDecision = decideZoneRulesRefresh(
          compareZoneRules(
            { release: releaseOf(committedZoneIds) },
            { release: releaseOf([]) },
          ),
        );
      },
    );
    Then(
      "the zone rules verdict is {string} and names {string}",
      (_ctx, verdict: string, zoneId: string) => {
        expect(zoneRulesDecision.verdict).toBe(verdict);
        expect(zoneRulesDecision.reasons.join("\n")).toContain(zoneId);
      },
    );
  });

  // @refresh-data-through-scheduled-pull-requests @FR7
  f.Scenario("Zone rules that lose coordinates", ({ Given, When, Then }) => {
    Given(
      "the committed zone coordinates hold {string}",
      (_ctx, zoneId: string) => {
        committedCoordinateIds = [zoneId];
      },
    );
    When("the refreshed zone coordinates do not", () => {
      const release = releaseOf(committedCoordinateIds);
      zoneRulesDecision = decideZoneRulesRefresh(
        compareZoneRules(
          { release, coordinates: releaseOf(committedCoordinateIds) },
          { release, coordinates: releaseOf([]) },
        ),
      );
    });
    Then(
      "the zone rules verdict is {string} and names {string}",
      (_ctx, verdict: string, zoneId: string) => {
        expect(zoneRulesDecision.verdict).toBe(verdict);
        expect(zoneRulesDecision.reasons.join("\n")).toContain(zoneId);
      },
    );
  });
});
