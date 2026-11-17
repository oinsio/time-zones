// Verifies FR8, FR9, FR10, NFR-P2, M3 of apply-data-updates-silently: the watched zones and the releases that change them.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { findChangedZones } from "@/lib/zoneRules";
import { getWatchedZoneIds, type WorldClockState } from "@/model";
import { createZone, releaseOf } from "@/test/zoneRules/lisbonLikeZone";
import {
  COMPARISON_SECONDS,
  LISBON,
  LISBON_DIFFERENCES,
  NON_COUNTING_DIFFERENCES,
  stateOf,
} from "./zoneRulesWatchedWorld";

const feature = await loadFeature(
  "../zone_rules_updates_watched_zones.feature",
);

const MOSCOW = "Europe/Moscow";
const ASUNCION = "America/Asuncion";
const CAIRO = "Africa/Cairo";
const STORED = "2026g";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let state: WorldClockState;
  let watchedZoneIds: string[] = [];
  let activeZones: Record<string, ReturnType<typeof createZone>> = {};
  let storedZones: Record<string, ReturnType<typeof createZone>> = {};
  let changedZones: string[] = [];

  const setUpReleases = () => {
    watchedZoneIds = [];
    activeZones = {
      [LISBON]: createZone(),
      [MOSCOW]: createZone(),
      [ASUNCION]: createZone(),
      [CAIRO]: createZone(),
    };
    storedZones = { ...activeZones };
  };
  const compare = () => {
    changedZones = findChangedZones(
      releaseOf(activeZones),
      releaseOf(storedZones, STORED),
      watchedZoneIds,
      COMPARISON_SECONDS,
    );
  };
  const expectChangesWatchedZone = () =>
    expect(changedZones.length).toBeGreaterThan(0);
  const expectChangesNoWatchedZone = () => expect(changedZones).toEqual([]);

  f.BeforeEachScenario(() => {
    setUpReleases();
  });

  // @apply-data-updates-silently @FR8 @M3
  f.ScenarioOutline(
    "Kinds of difference that count",
    ({ Given, When, Then }, variables) => {
      Given(
        "the list holds Lisbon and the comparison is made at {string}",
        () => {
          state = stateOf([LISBON], MOSCOW);
          watchedZoneIds = [LISBON];
        },
      );
      When(
        'the stored release differs from the active one for {string} only in <difference>, a difference of the kind "<kind>"',
        () => {
          storedZones = {
            ...storedZones,
            [LISBON]: LISBON_DIFFERENCES[String(variables.difference)] as never,
          };
          compare();
        },
      );
      Then(
        "the stored release changes a watched zone",
        expectChangesWatchedZone,
      );
    },
  );

  // @apply-data-updates-silently @FR8 @M3
  f.ScenarioOutline(
    "Differences that do not count",
    ({ Given, When, Then }, variables) => {
      Given(
        "the list holds Lisbon, the device time zone is {string} and the comparison is made at {string}",
        (_ctx, deviceZone: string) => {
          state = stateOf([LISBON], deviceZone);
          watchedZoneIds = getWatchedZoneIds(state);
        },
      );
      When(
        "the stored release differs from the active one only in <difference>",
        () => {
          storedZones = {
            ...storedZones,
            ...NON_COUNTING_DIFFERENCES[String(variables.difference)],
          };
          compare();
        },
      );
      Then(
        "the stored release changes no watched zone",
        expectChangesNoWatchedZone,
      );
    },
  );

  // @apply-data-updates-silently @FR8 @FR9
  f.Scenario("The device time zone is watched", ({ Given, When, Then }) => {
    Given(
      "the list is empty and the device time zone is {string}",
      (_ctx, deviceZone: string) => {
        state = stateOf([], deviceZone);
        watchedZoneIds = getWatchedZoneIds(state);
      },
    );
    When(
      "the stored release moves the next clock change of {string}",
      (_ctx, zoneId: string) => {
        storedZones = {
          ...storedZones,
          [zoneId]: LISBON_DIFFERENCES[
            "the instant of the clock change of March 2027"
          ] as never,
        };
        compare();
      },
    );
    Then("the stored release changes a watched zone", expectChangesWatchedZone);
  });

  // @apply-data-updates-silently @FR8
  f.Scenario("A link that keeps its rules", ({ Given, When, Then }) => {
    Given(
      'the list holds Luanda in {string}, a link to "Africa/Lagos" in the active release',
      (_ctx, zoneId: string) => {
        state = stateOf([zoneId], MOSCOW);
        watchedZoneIds = [zoneId];
        const lagosRules = createZone();
        activeZones = { [zoneId]: lagosRules, "Africa/Lagos": lagosRules };
      },
    );
    When(
      "the stored release makes {string} a zone of its own with the same rules from the comparison instant on",
      (_ctx, zoneId: string) => {
        storedZones = {
          [zoneId]: structuredClone(activeZones[zoneId] as never),
          "Africa/Lagos": structuredClone(activeZones[zoneId] as never),
        };
        compare();
      },
    );
    Then(
      "the stored release changes no watched zone",
      expectChangesNoWatchedZone,
    );
  });

  // @apply-data-updates-silently @FR8
  f.Scenario("A zone only one release holds", ({ Given, When, Then }) => {
    Given("the list holds a location in {string}", (_ctx, zoneId: string) => {
      state = stateOf([zoneId], MOSCOW);
      watchedZoneIds = [zoneId];
    });
    When(
      "the stored release no longer holds {string}",
      (_ctx, zoneId: string) => {
        const { [zoneId]: _removed, ...remainingZones } = storedZones;
        storedZones = remainingZones;
        compare();
      },
    );
    Then("the stored release changes a watched zone", expectChangesWatchedZone);
  });
});
