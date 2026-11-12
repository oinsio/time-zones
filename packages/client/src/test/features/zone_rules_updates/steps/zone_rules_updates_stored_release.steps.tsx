// Verifies FR3, FR4, FR7, FR9, NFR-P1, M4 of add-remote-zone-rules-updates: the check through the hook.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { createLocalStorageStoredReleaseRepository } from "@/adapters";
import { STORAGE_KEYS, STORED_RELEASE_SCHEMA_VERSION } from "@/constants";
import { StoredReleaseLoadStatus } from "@/ports";
import { resetPageVisibility } from "@/test/pageVisibility";
import { buildReleaseDocument } from "@/test/zoneRules/buildReleaseDocument";
import {
  createZoneRulesUpdateWorld,
  publishing,
  SIXTEEN_MINUTES_LATER,
  type ZoneRulesUpdateWorldOptions,
} from "@/test/zoneRules/zoneRulesUpdateWorld";

const feature = await loadFeature(
  "../zone_rules_updates_stored_release.feature",
);

const LOCATIONS_DOCUMENT = '{"schemaVersion":1,"payload":"locations"}';
const PREFERENCES_DOCUMENT = '{"schemaVersion":1,"payload":"preferences"}';

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
  const dismissThenRecheckAt = async (instant: string) => {
    await startCheck();
    world.result.current.dismiss();
    await world.returnToPage(instant);
  };

  // @add-remote-zone-rules-updates @FR9 @NFR-P1
  f.Scenario("Envelope", ({ Given, When, Then, And }) => {
    Given(
      'the active release is "2026f" and the version file names "2026g"',
      () => {
        localStorage.setItem(STORAGE_KEYS.LOCATIONS, LOCATIONS_DOCUMENT);
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, PREFERENCES_DOCUMENT);
        options = {
          script: publishing("2026g"),
          storedReleases: createLocalStorageStoredReleaseRepository({
            getStorage: () => localStorage,
          }),
        };
      },
    );
    When("the app checks for a zone rules update", startCheck);
    Then(
      'the document under the zone rules key has schema version 1 and a payload whose release is "2026g"',
      () => {
        const document = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.ZONE_RULES) ?? "null",
        );
        expect(document.schemaVersion).toBe(STORED_RELEASE_SCHEMA_VERSION);
        expect(document.payload.release).toBe("2026g");
      },
    );
    And("the locations and preferences documents are unchanged", () => {
      expect(localStorage.getItem(STORAGE_KEYS.LOCATIONS)).toBe(
        LOCATIONS_DOCUMENT,
      );
      expect(localStorage.getItem(STORAGE_KEYS.PREFERENCES)).toBe(
        PREFERENCES_DOCUMENT,
      );
    });
  });

  // @add-remote-zone-rules-updates @FR9
  f.Scenario("Storage unavailable", ({ Given, When, Then, And }) => {
    Given(
      "storage is unavailable and the version file names a newer release",
      () => {
        options = { script: publishing("2026g"), isStorageWritable: false };
      },
    );
    When("the app checks for a zone rules update", startCheck);
    Then("the zone rules update notice is not shown", () => {
      expect(world.result.current.readyRelease).toBeUndefined();
    });
    And("nothing is written", () => {
      expect(world.storedReleases.load().status).toBe(
        StoredReleaseLoadStatus.EMPTY,
      );
    });
  });

  // @add-remote-zone-rules-updates @FR9
  f.Scenario(
    "An unstored release is not downloaded again",
    ({ Given, When, Then, And }) => {
      Given('a save of the newer release "2026g" failed', () => {
        options = { script: publishing("2026g"), isStorageWritable: false };
      });
      When(
        'the app checks again for a zone rules update and the version file still names "2026g"',
        async () => {
          await startCheck();
          await world.returnToPage(SIXTEEN_MINUTES_LATER);
        },
      );
      Then("only the version file is requested", () => {
        expect(world.versionSource.versionRequestCount()).toBe(2);
        expect(world.versionSource.requestedReleases()).toEqual(["2026g"]);
      });
      And("the zone rules update notice is not shown", () => {
        expect(world.result.current.readyRelease).toBeUndefined();
      });
    },
  );

  // @add-remote-zone-rules-updates @FR7
  f.Scenario("Dismiss then recheck", ({ Given, When, Then }) => {
    Given('the notice for "2026g" was dismissed', () => {
      options = { script: publishing("2026g") };
    });
    When('the next check finds "2026g" still published', () =>
      dismissThenRecheckAt(SIXTEEN_MINUTES_LATER),
    );
    Then("no notice is shown", () => {
      expect(world.result.current.readyRelease).toBeUndefined();
    });
  });

  // @add-remote-zone-rules-updates @FR7
  f.Scenario("A newer release after dismissal", ({ Given, When, Then }) => {
    Given('the notice for "2026g" was dismissed', () => {
      options = { script: publishing("2026g") };
    });
    When('a check stores "2026h"', async () => {
      await startCheck();
      world.result.current.dismiss();
      world.versionSource.setVersion({ release: "2026h" });
      world.versionSource.setRelease("2026h", buildReleaseDocument("2026h"));
      await world.returnToPage(SIXTEEN_MINUTES_LATER);
    });
    Then('the notice names "2026h"', () => {
      expect(world.result.current.readyRelease).toBe("2026h");
    });
  });
});
