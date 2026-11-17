// Verifies FR3, FR4 of add-remote-zone-rules-updates: when the check runs and when it stays silent.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { resetPageVisibility } from "@/test/pageVisibility";
import {
  createZoneRulesUpdateWorld,
  publishing,
  SIXTEEN_MINUTES_LATER,
  type ZoneRulesUpdateWorldOptions,
} from "@/test/zoneRules/zoneRulesUpdateWorld";

const feature = await loadFeature(
  "../zone_rules_updates_check_schedule.feature",
);

const FIVE_MINUTES_AFTER_THE_RETURN = "2026-03-08T07:51:00Z";

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
});
