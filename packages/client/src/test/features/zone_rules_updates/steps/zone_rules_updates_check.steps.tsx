// Verifies FR3, FR4, FR7, FR9, NFR-P1, M4 of add-remote-zone-rules-updates: the check through the hook.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { StoredReleaseLoadStatus, ZoneRulesSourceFailure } from "@/ports";
import { resetPageVisibility } from "@/test/pageVisibility";
import { buildReleaseDocument } from "@/test/zoneRules/buildReleaseDocument";
import {
  createZoneRulesUpdateWorld,
  publishing,
  SIXTEEN_MINUTES_LATER,
  type ZoneRulesUpdateWorldOptions,
} from "@/test/zoneRules/zoneRulesUpdateWorld";

const feature = await loadFeature("../zone_rules_updates_check.feature");

const FIVE_MINUTES_AFTER_THE_RETURN = "2026-03-08T07:51:00Z";

const FAILURE_OPTIONS: Record<string, ZoneRulesUpdateWorldOptions> = {
  "the version file request fails": {
    script: { version: ZoneRulesSourceFailure.REQUEST_FAILED },
  },
  "the version file returns status 404": {
    script: { version: ZoneRulesSourceFailure.REQUEST_FAILED },
  },
  "the version file is not JSON": {
    script: { version: ZoneRulesSourceFailure.UNPARSABLE },
  },
  'the version file names the invalid release name "latest"': {
    script: { version: { release: "latest" } },
  },
  'the release file of "2026g" is not a valid zone rules release': {
    script: {
      version: { release: "2026g" },
      releases: { "2026g": { release: "2026g" } },
    },
  },
  'the release file of "2026g" names the release "2026h"': {
    script: {
      version: { release: "2026g" },
      releases: { "2026g": buildReleaseDocument("2026h") },
    },
  },
};

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let options: ZoneRulesUpdateWorldOptions = {};
  let world: ReturnType<typeof createZoneRulesUpdateWorld>;
  let versionRequestCounts: number[] = [];

  f.BeforeEachScenario(() => {
    options = {};
    versionRequestCounts = [];
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
      'the active release is "2026f" and the version file names "2026g"',
      () => {
        options = { script: publishing("2026g") };
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
        'the active release is "2026f", "2026g" is the stored release and the version file names "2026g"',
        () => {
          options = {
            script: publishing("2026g"),
            storedDocument: buildReleaseDocument("2026g"),
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

  // @add-remote-zone-rules-updates @FR3
  f.Scenario(
    "Checks follow the update recheck rule",
    ({ Given, When, Then, And }) => {
      Given("the app last checked 16 minutes ago", () => {
        options = { script: publishing("2026f") };
      });
      When("the page becomes visible", async () => {
        await startCheck();
        const before = world.versionSource.versionRequestCount();
        await world.returnToPage(SIXTEEN_MINUTES_LATER);
        const afterReturn = world.versionSource.versionRequestCount();
        await world.returnToPage(FIVE_MINUTES_AFTER_THE_RETURN);
        versionRequestCounts = [
          before,
          afterReturn,
          world.versionSource.versionRequestCount(),
        ];
      });
      Then("the version file is requested once", () => {
        expect(versionRequestCounts[1] - versionRequestCounts[0]).toBe(1);
      });
      And("a return 5 minutes after that check requests nothing", () => {
        expect(versionRequestCounts[2]).toBe(versionRequestCounts[1]);
      });
    },
  );

  // @add-remote-zone-rules-updates @FR3
  f.Scenario("No active release", ({ Given, When, Then }) => {
    Given("the zone rules failed to load at start", () => {
      options = { activeRelease: null, script: publishing("2026g") };
    });
    When("a check is due", async () => {
      await startCheck();
      await world.returnToPage(SIXTEEN_MINUTES_LATER);
    });
    Then("no request is made", () => {
      expect(world.versionSource.versionRequestCount()).toBe(0);
    });
  });

  // @add-remote-zone-rules-updates @FR4
  f.Scenario("Offline", ({ Given, When, Then }) => {
    Given("the device is offline", () => {
      options = { isOnline: false, script: publishing("2026g") };
    });
    When("a check is due", async () => {
      await startCheck();
      await world.returnToPage(SIXTEEN_MINUTES_LATER);
    });
    Then("no request is made and no notice is shown", () => {
      expect(world.versionSource.versionRequestCount()).toBe(0);
      expect(world.result.current.readyRelease).toBeUndefined();
    });
  });

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
