// Implements FR1, FR4 of add-zone-rules-from-iana: executable scenarios of the lookup.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import { type LocalTimeType, SECONDS_PER_HOUR } from "@/lib/zoneRules";
import {
  type FreshModules,
  startOnStaleEngine,
  stopStaleEngine,
} from "@/test/staleEngineWorld";

import {
  presentAlmaty,
  readLocalTimeType,
  readOffsetSeconds,
} from "./zoneRulesLookupWorld";

const feature = await loadFeature("../zone_rules_lookup.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let localTimeType: LocalTimeType;
  let modules: FreshModules;

  f.AfterEachScenario(stopStaleEngine);

  const givenStaleAlmaty = async () => {
    modules = (await startOnStaleEngine()).modules;
  };

  // @add-zone-rules-from-iana @FR4 @M3
  f.ScenarioOutline(
    "Lookup across the three ranges",
    ({ When, Then }, variables: Record<string, string>) => {
      When("the local time type of <zone> at <instant> is read", () => {
        localTimeType = readLocalTimeType(variables.zone, variables.instant);
      });
      Then(
        "the offset is <offset> and the designation is <designation>",
        () => {
          expect(localTimeType.utcOffsetSeconds).toBe(
            readOffsetSeconds(variables.offset),
          );
          expect(localTimeType.designation).toBe(variables.designation);
        },
      );
    },
  );

  // @add-zone-rules-from-iana @FR4
  f.Scenario("Before the cutoff the cutoff type holds", ({ When, Then }) => {
    When(
      "the local time type of {string} at {string} is read",
      (_ctx, zoneId: string, instant: string) => {
        localTimeType = readLocalTimeType(zoneId, instant);
      },
    );
    Then(
      "it is the type in force at {string}, UTC plus 3 {string}",
      (_ctx, cutoffInstant: string, designation: string) => {
        expect(localTimeType).toEqual(
          readLocalTimeType("Europe/Moscow", cutoffInstant),
        );
        expect(localTimeType.utcOffsetSeconds).toBe(3 * SECONDS_PER_HOUR);
        expect(localTimeType.designation).toBe(designation);
      },
    );
  });

  // @add-zone-rules-from-iana @FR1 @UX1 @M3
  f.Scenario(
    "A stale engine shows the current rules",
    ({ Given, And, When, Then }) => {
      let rowTexts: string[] = [];
      Given(
        "the engine's own data places {string} at UTC plus 6",
        givenStaleAlmaty,
      );
      And("the list contains Almaty", () => undefined);
      When("the rows are presented at {string}", (_ctx, instant: string) => {
        const { row } = presentAlmaty(modules, instant);
        rowTexts = [row.localTimeLabel, row.utcOffsetLabel];
      });
      Then(
        "the Almaty row shows {string} and {string}",
        (_ctx, time: string, offset: string) => {
          expect(rowTexts).toEqual([time, offset]);
        },
      );
    },
  );

  // @add-zone-rules-from-iana @FR1 @UX1 @M3
  f.Scenario("Temporal and the presenter agree", ({ Given, When, Then }) => {
    let presented: ReturnType<typeof presentAlmaty>;
    Given(
      "the engine's own data places {string} at UTC plus 6",
      givenStaleAlmaty,
    );
    When(
      "the local time, the hour labels, the wall-time hint and the date bar of Almaty are presented at {string}",
      (_ctx, instant: string) => {
        presented = presentAlmaty(modules, instant);
      },
    );
    Then(
      "every one of them shows the {string} local time of UTC plus 5",
      (_ctx, time: string) => {
        const [hourText] = time.split(":");
        expect(presented.row.localTimeLabel).toBe(time);
        expect(presented.hourCell?.hourText).toBe(hourText);
        expect(presented.row.wallTimeHint).toContain(time);
        expect(presented.dateBar.gapNote).toContain(time);
      },
    );
  });

  // @add-zone-rules-from-iana @FR1 @UX1
  f.Scenario(
    "Wall-clock resolution uses the rules",
    ({ Given, When, Then }) => {
      let resolved: ReturnType<FreshModules["model"]["resolveWallClock"]>;
      Given(
        "the engine's own data places {string} at UTC plus 6",
        givenStaleAlmaty,
      );
      When(
        "the wall-clock time {string} in {string} is resolved",
        (_ctx, wallClock: string, zoneId: string) => {
          const { model, temporal } = modules;
          resolved = model.resolveWallClock(
            zoneId,
            temporal.Temporal.PlainDateTime.from(wallClock),
          );
        },
      );
      Then(
        "it resolves to {string} with the status {string}",
        (_ctx, instant: string, status: string) => {
          expect(resolved.instant.toString()).toBe(
            Temporal.Instant.from(instant).toString(),
          );
          expect(resolved.status).toBe(status);
        },
      );
    },
  );
});
