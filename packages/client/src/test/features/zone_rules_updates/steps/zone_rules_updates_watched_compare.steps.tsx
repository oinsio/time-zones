// Verifies FR10, NFR-P2 of apply-data-updates-silently: the watched zones are compared when they can change.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { parseZoneRulesRelease } from "@/lib/zoneRules";
import { getWatchedZoneIds } from "@/model";
import { resetPageVisibility } from "@/test/pageVisibility";
import { startZoneComparisonCount } from "@/test/zoneComparisonCount";
import { buildDocument } from "@/test/zoneRules/releaseDocuments";
import {
  buildWatchedZonesDocument,
  CAIRO_ZONE_ID,
  LISBON_ZONE_ID,
  parseWatchedZonesRelease,
} from "@/test/zoneRules/watchedZoneReleases";
import {
  createZoneRulesUpdateWorld,
  SIXTEEN_MINUTES_LATER,
} from "@/test/zoneRules/zoneRulesUpdateWorld";
import { stateOf } from "./zoneRulesWatchedWorld";

vi.mock("@/lib/zoneRules", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/zoneRules")>();
  const { countFindChangedZones } = await import("@/test/zoneComparisonCount");
  return {
    ...original,
    findChangedZones: countFindChangedZones(original.findChangedZones),
  };
});

const feature = await loadFeature(
  "../zone_rules_updates_watched_compare.feature",
);

const MOSCOW = "Europe/Moscow";
const LISTED_LOCATION_COUNT = 50;
const LISTED_ZONE_COUNT = 12;
const MINUTE_TICK_COUNT = 10;
const STORED = "2026g";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  f.AfterEachScenario(resetPageVisibility);

  // @apply-data-updates-silently @FR10
  f.Scenario("Adding a location compares again", ({ Given, When, Then }) => {
    // A rendered hook is unmounted after each step, so the When step renders and acts.
    let release = "";
    let changedZone = "";
    let readyBeforeAdding: string | undefined = "not read";
    let readyAfterAdding: string | undefined;
    Given(
      "the stored release {string} changes only {string}, the list holds Lisbon and no notice is shown",
      (_ctx, storedRelease: string, zoneId: string) => {
        release = storedRelease;
        changedZone = zoneId;
      },
    );
    When("the user adds Cairo", async () => {
      const world = createZoneRulesUpdateWorld({
        activeRelease: parseWatchedZonesRelease("2026f"),
        watchedZoneIds: [LISBON_ZONE_ID],
        script: {
          version: { release },
          releases: {
            [release]: buildWatchedZonesDocument(release, [changedZone]),
          },
        },
      });
      await world.settle();
      readyBeforeAdding = world.result.current.readyRelease;
      world.watchZones(
        getWatchedZoneIds(stateOf([LISBON_ZONE_ID, CAIRO_ZONE_ID], MOSCOW)),
      );
      readyAfterAdding = world.result.current.readyRelease;
    });
    Then(
      "the zone rules update notice names {string}",
      (_ctx, storedRelease: string) => {
        expect(readyBeforeAdding).toBeUndefined();
        expect(readyAfterAdding).toBe(storedRelease);
      },
    );
  });

  // @apply-data-updates-silently @FR10 @NFR-P2
  f.Scenario("Work bound", ({ Given, When, Then, And }) => {
    const zoneIds = Array.from(
      { length: LISTED_ZONE_COUNT },
      (_unused, index) => `Test/Zone${index}`,
    );
    const deviceZone = "Test/Device";
    let watchedIds: string[] = [];
    let world: ReturnType<typeof createZoneRulesUpdateWorld>;
    let counter: ReturnType<typeof startZoneComparisonCount>;
    const zonesDocument = (release: string) =>
      buildDocument({
        release,
        zones: Object.fromEntries(
          [...zoneIds, deviceZone].map((zoneId) => [
            zoneId,
            {
              types: [[0, "UTC", 0]],
              cutoffType: 0,
              changes: [],
              futureRule: "",
            },
          ]),
        ),
      });
    Given(
      "the list holds 50 locations in 12 zones, the device time zone is none of them, and a newer release was just stored",
      () => {
        const listedZones = Array.from(
          { length: LISTED_LOCATION_COUNT },
          (_unused, index) => zoneIds[index % LISTED_ZONE_COUNT] as string,
        );
        watchedIds = getWatchedZoneIds(stateOf(listedZones, deviceZone));
        counter = startZoneComparisonCount();
      },
    );
    // A rendered hook is unmounted after each step, so the When step renders and acts.
    When("the stored release is compared and 10 minutes pass", async () => {
      world = createZoneRulesUpdateWorld({
        activeRelease: parseZoneRulesRelease(zonesDocument("2026f")) as never,
        watchedZoneIds: watchedIds,
        script: {
          version: { release: STORED },
          releases: { [STORED]: zonesDocument(STORED) },
        },
      });
      await world.settle();
      for (let minute = 0; minute < MINUTE_TICK_COUNT; minute += 1) {
        world.rerender({ zoneIds: [...watchedIds] });
      }
      await world.returnToPage(SIXTEEN_MINUTES_LATER);
    });
    Then(
      "13 zones were compared, each once: the 12 zones of the list and the device time zone",
      () => {
        expect(counter.comparedZones()).toBe(LISTED_ZONE_COUNT + 1);
        for (const count of counter.comparedZonesByZone().values()) {
          expect(count).toBe(1);
        }
        expect(counter.comparedZonesByZone().get(deviceZone)).toBe(1);
      },
    );
    And("no zone was compared on a minute tick", () => {
      expect(counter.comparedZones()).toBe(LISTED_ZONE_COUNT + 1);
      counter.stop();
    });
  });
});
