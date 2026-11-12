// Implements FR2, FR7, FR8 of add-zone-rules-from-iana: executable scenarios of the release and its compiler.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  getLocalTimeType,
  parseZoneRulesRelease,
  SECONDS_PER_HOUR,
  type ZoneRules,
  ZoneRulesReleaseError,
} from "@/lib/zoneRules";
import { committedRelease } from "@/test/installZoneRules";
import { ZONE_RULES_RELEASE_FILE } from "../../../../../app.config";
import {
  compareWithRelease,
  parseZdumpLines,
  type ZdumpDifference,
} from "../../../../../scripts/zoneRules/checkAgainstZdump.ts";

const feature = await loadFeature("../zone_rules_release.feature");

const MILLISECONDS_PER_SECOND = 1000;
const LISTED_CHANGES_END_YEAR = 2007;
const ZDUMP_ZONE_IDS = ["America/New_York", "Asia/Almaty", "Europe/Dublin"];
const ZDUMP_DIRECTORY = join(__dirname, "../../../zoneRules/fixtures/zdump");
const WRONG_NEW_YORK_FUTURE_RULE = "EST5EDT,M3.2.0,M10.1.0";

const committedDocument = JSON.parse(
  readFileSync(ZONE_RULES_RELEASE_FILE, "utf8"),
);
const toEpochSeconds = (instant: string) =>
  Temporal.Instant.from(instant).epochMilliseconds / MILLISECONDS_PER_SECOND;

function readZone(zoneId: string): ZoneRules {
  const zoneRules = committedRelease.zones.get(zoneId);
  if (!zoneRules) throw new Error(`The release lacks ${zoneId}`);
  return zoneRules;
}

function readFutureRuleText(zoneId: string): string {
  return committedDocument.zones[zoneId].futureRule;
}

function readZdump(zoneId: string) {
  return parseZdumpLines(
    readFileSync(
      join(ZDUMP_DIRECTORY, `${zoneId.replace("/", "_")}.txt`),
      "utf8",
    ),
  );
}

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let zoneRules: ZoneRules;
  let difference: ZdumpDifference | undefined;

  const readZoneRules = (_ctx: unknown, zoneId: string) => {
    zoneRules = readZone(zoneId);
  };
  // @add-zone-rules-from-iana @FR2
  f.Scenario("A local time type", ({ When, Then }) => {
    let localTimeType: ZoneRules["cutoffType"];
    When("a local time type of the release is read", () => {
      localTimeType = readZone("America/New_York").cutoffType;
    });
    Then(
      "it holds a UTC offset in seconds, a tzdb designation and a daylight saving flag",
      () => {
        expect(typeof localTimeType.utcOffsetSeconds).toBe("number");
        expect(typeof localTimeType.designation).toBe("string");
        expect(typeof localTimeType.isDaylightSavingTime).toBe("boolean");
      },
    );
  });

  // @add-zone-rules-from-iana @FR2
  f.Scenario("A zone with a future rule", ({ When, Then, And }) => {
    When("the zone rules of {string} are read from the release", readZoneRules);
    Then("its cutoff type is UTC−5 {string}", (_ctx, designation: string) => {
      expect(zoneRules.cutoffType.utcOffsetSeconds).toBe(-5 * SECONDS_PER_HOUR);
      expect(zoneRules.cutoffType.designation).toBe(designation);
    });
    And("its listed clock changes end in 2007", () => {
      const lastChange = zoneRules.changes.at(-1);
      const lastChangeYear = Temporal.Instant.fromEpochMilliseconds(
        (lastChange?.epochSeconds ?? 0) * MILLISECONDS_PER_SECOND,
      ).toZonedDateTimeISO("UTC").year;
      expect(lastChangeYear).toBe(LISTED_CHANGES_END_YEAR);
    });
    And("its future rule is {string}", (_ctx, ruleText: string) => {
      expect(readFutureRuleText("America/New_York")).toBe(ruleText);
    });
  });

  // @add-zone-rules-from-iana @FR2
  f.Scenario("A zone whose last type holds forever", ({ When, Then, And }) => {
    When(
      "the zone rules of {string} are read from the release {string}",
      (_ctx, zoneId: string, release: string) => {
        expect(committedRelease.release).toBe(release);
        readZoneRules(_ctx, zoneId);
      },
    );
    Then(
      "its listed clock changes end with {string} to UTC plus 5 {string}",
      (_ctx, instant: string, designation: string) => {
        const lastChange = zoneRules.changes.at(-1);
        expect(lastChange?.epochSeconds).toBe(toEpochSeconds(instant));
        expect(lastChange?.localTimeType.utcOffsetSeconds).toBe(
          5 * SECONDS_PER_HOUR,
        );
        expect(lastChange?.localTimeType.designation).toBe(designation);
      },
    );
    And(
      "it has a standard-only future rule {string}",
      (_ctx, ruleText: string) => {
        expect(readFutureRuleText("Asia/Almaty")).toBe(ruleText);
        expect(zoneRules.futureRule?.daylight).toBeUndefined();
      },
    );
  });

  // @add-zone-rules-from-iana @FR2
  f.Scenario(
    "A zone whose listed changes end before the cutoff",
    ({ When, Then, And }) => {
      When(
        "the zone rules of {string} are read from the release {string}",
        (_ctx, zoneId: string) => {
          readZoneRules(_ctx, zoneId);
        },
      );
      Then("it lists no clock change after the cutoff", () => {
        expect(zoneRules.changes).toEqual([]);
      });
      And(
        "its cutoff type is UTC plus 0 {string} with the daylight saving flag set, as its future rule {string} gives at {string}",
        (_ctx, designation: string, ruleText: string, instant: string) => {
          expect(readFutureRuleText("Europe/Dublin")).toBe(ruleText);
          expect(zoneRules.cutoffType).toEqual({
            utcOffsetSeconds: 0,
            designation,
            isDaylightSavingTime: true,
          });
          expect(getLocalTimeType(zoneRules, toEpochSeconds(instant))).toEqual(
            zoneRules.cutoffType,
          );
        },
      );
    },
  );

  // @add-zone-rules-from-iana @FR2
  f.Scenario("A link resolves to its target's rules", ({ When, Then }) => {
    When("the zone rules of {string} are read", readZoneRules);
    Then("they equal the zone rules of {string}", (_ctx, targetId: string) => {
      expect(zoneRules).toEqual(readZone(targetId));
    });
  });

  // @add-zone-rules-from-iana @FR2
  f.Scenario("The release carries its name", ({ When, Then }) => {
    When("a release compiled from {string} is read", () => undefined);
    Then("its release name is {string}", (_ctx, release: string) => {
      expect(committedRelease.release).toBe(release);
    });
  });

  // @add-zone-rules-from-iana @FR8 @G4
  f.Scenario("The committed release passes", ({ When, Then }) => {
    let differences: (ZdumpDifference | undefined)[] = [];
    When("the zone rules check runs on the committed release {string}", () => {
      differences = ZDUMP_ZONE_IDS.map((zoneId) =>
        compareWithRelease(committedRelease, zoneId, readZdump(zoneId)),
      );
    });
    Then("it reports {int} differences", (_ctx, expectedCount: number) => {
      expect(differences.filter(Boolean)).toHaveLength(expectedCount);
    });
  });

  // @add-zone-rules-from-iana @FR8 @G4
  f.Scenario("A wrong rule fails the check", ({ Given, When, Then }) => {
    let wrongRelease: typeof committedRelease;
    Given(
      "a release in which the future rule of {string} ends daylight time on the first Sunday of October",
      () => {
        const parsed = parseZoneRulesRelease({
          ...committedDocument,
          zones: {
            ...committedDocument.zones,
            "America/New_York": {
              ...committedDocument.zones["America/New_York"],
              futureRule: WRONG_NEW_YORK_FUTURE_RULE,
            },
          },
        });
        if (parsed instanceof ZoneRulesReleaseError) throw parsed;
        wrongRelease = parsed;
      },
    );
    When("the zone rules check runs", () => {
      difference = compareWithRelease(
        wrongRelease,
        "America/New_York",
        readZdump("America/New_York"),
      );
    });
    Then(
      "it fails and names {string} and the first differing instant",
      (_ctx, zoneId: string) => {
        expect(difference?.zoneId).toBe(zoneId);
        expect(difference?.instant).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      },
    );
  });
});
