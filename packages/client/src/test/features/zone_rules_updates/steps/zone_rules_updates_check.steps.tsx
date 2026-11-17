// Verifies FR3, FR4, FR7, FR9, NFR-P1, M4 of add-remote-zone-rules-updates: the check through the hook.
// Verifies FR8, FR9 of apply-data-updates-silently: the notice only for a watched zone.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { StoredReleaseLoadStatus } from "@/ports";
import { resetPageVisibility } from "@/test/pageVisibility";
import {
  ASUNCION_ZONE_ID,
  buildWatchedZonesDocument,
  LISBON_ZONE_ID,
  parseWatchedZonesRelease,
} from "@/test/zoneRules/watchedZoneReleases";
import {
  createZoneRulesUpdateWorld,
  publishing,
  type ZoneRulesUpdateWorldOptions,
} from "@/test/zoneRules/zoneRulesUpdateWorld";
import { FAILURE_OPTIONS } from "./zoneRulesCheckFailureOptions";

const feature = await loadFeature("../zone_rules_updates_check.feature");

/** The list holds Lisbon; the version file names "2026g", which changes the given zones. */
const listHoldingLisbonAndPublishing = (
  changedZoneIds: string[],
): ZoneRulesUpdateWorldOptions => ({
  activeRelease: parseWatchedZonesRelease("2026f"),
  watchedZoneIds: [LISBON_ZONE_ID],
  script: {
    version: { release: "2026g" },
    releases: { "2026g": buildWatchedZonesDocument("2026g", changedZoneIds) },
  },
});

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let options: ZoneRulesUpdateWorldOptions = {};
  let world: ReturnType<typeof createZoneRulesUpdateWorld>;

  f.BeforeEachScenario(() => {
    options = {};
    localStorage.clear();
  });
  f.AfterEachScenario(resetPageVisibility);

  const startCheck = async () => {
    world = createZoneRulesUpdateWorld(options);
    await world.settle();
  };

  // @add-remote-zone-rules-updates @FR3
  f.Scenario("A newer release is published", ({ Given, When, Then, And }) => {
    Given(
      'the active release is "2026f", the list holds Lisbon and the version file names "2026g", which changes the rules of "Europe/Lisbon"',
      () => {
        options = listHoldingLisbonAndPublishing([LISBON_ZONE_ID]);
      },
    );
    When("the app checks for a zone rules update", startCheck);
    Then('the release file of "2026g" is requested once', () => {
      expect(world.versionSource.requestedReleases()).toEqual(["2026g"]);
    });
    And('"2026g" becomes the stored release', () => {
      const stored = world.storedReleases.load();
      expect(
        stored.status === StoredReleaseLoadStatus.LOADED &&
          stored.release.release,
      ).toBe("2026g");
    });
    And('the zone rules update notice names "2026g"', () => {
      expect(world.result.current.readyRelease).toBe("2026g");
    });
  });

  // @apply-data-updates-silently @FR8 @FR9
  f.Scenario(
    "A newer release that changes no watched zone",
    ({ Given, When, Then, And }) => {
      Given(
        'the active release is "2026f", the list holds Lisbon and the version file names "2026g", which changes only the rules of "America/Asuncion"',
        () => {
          options = listHoldingLisbonAndPublishing([ASUNCION_ZONE_ID]);
        },
      );
      When("the app checks for a zone rules update", startCheck);
      Then('the release file of "2026g" is requested once', () => {
        expect(world.versionSource.requestedReleases()).toEqual(["2026g"]);
      });
      And('"2026g" becomes the stored release', () => {
        const stored = world.storedReleases.load();
        expect(
          stored.status === StoredReleaseLoadStatus.LOADED &&
            stored.release.release,
        ).toBe("2026g");
      });
      And("no notice is shown", () => {
        expect(world.result.current.readyRelease).toBeUndefined();
      });
    },
  );

  // @add-remote-zone-rules-updates @FR3
  f.ScenarioOutline(
    "The published release is not newer",
    ({ Given, When, Then }, variables) => {
      Given(
        'the active release is "2026f" and the version file names "<release>"',
        () => {
          options = { script: publishing(String(variables.release)) };
        },
      );
      When("the app checks for a zone rules update", startCheck);
      Then("exactly one request was made and no notice is shown", () => {
        expect(world.versionSource.versionRequestCount()).toBe(1);
        expect(world.versionSource.requestedReleases()).toEqual([]);
        expect(world.result.current.readyRelease).toBeUndefined();
      });
    },
  );

  // @add-remote-zone-rules-updates @FR3
  f.Scenario(
    "The newer release is already stored",
    ({ Given, When, Then, And }) => {
      Given(
        'the active release is "2026f", "2026g" is the stored release and changes the rules of a watched zone, and the version file names "2026g"',
        () => {
          options = {
            ...listHoldingLisbonAndPublishing([LISBON_ZONE_ID]),
            storedDocument: buildWatchedZonesDocument("2026g", [
              LISBON_ZONE_ID,
            ]),
          };
        },
      );
      When("the app checks for a zone rules update", startCheck);
      Then("no release file is requested and nothing is written", () => {
        expect(world.versionSource.requestedReleases()).toEqual([]);
        expect(world.save).not.toHaveBeenCalled();
      });
      And('the zone rules update notice names "2026g"', () => {
        expect(world.result.current.readyRelease).toBe("2026g");
      });
    },
  );

  // @add-remote-zone-rules-updates @FR4
  f.ScenarioOutline(
    "Failures change nothing",
    ({ Given, When, Then }, variables) => {
      Given('the active release is "2026f" and <failure>', () => {
        options = FAILURE_OPTIONS[String(variables.failure)];
      });
      When("the app checks for a zone rules update", startCheck);
      Then("no notice is shown and nothing is written", () => {
        expect(world.result.current.readyRelease).toBeUndefined();
        expect(world.save).not.toHaveBeenCalled();
      });
    },
  );
});
