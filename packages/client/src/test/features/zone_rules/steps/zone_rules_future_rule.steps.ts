// Implements FR3 of add-zone-rules-from-iana: executable scenarios of the future rule.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  type FutureRule,
  type LocalTimeType,
  parseFutureRule,
  resolveFutureRule,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
} from "@/lib/zoneRules";

const feature = await loadFeature("../zone_rules_future_rule.feature");

const MILLISECONDS_PER_SECOND = 1000;
const MINUS_SIGN = "−";

function readRule(ruleText: string): FutureRule {
  const rule = parseFutureRule(ruleText);
  if (!rule) throw new Error(`The rule does not parse: ${ruleText}`);
  return rule;
}

function toEpochSeconds(instant: string): number {
  return (
    Temporal.Instant.from(instant).epochMilliseconds / MILLISECONDS_PER_SECOND
  );
}

/** Seconds east of UTC of a text such as `−04:00` or `+05:30`. */
function readOffsetSeconds(offsetText: string): number {
  const sign = offsetText.startsWith(MINUS_SIGN) ? -1 : 1;
  const [hours, minutes] = offsetText.slice(1).split(":").map(Number);
  return sign * (hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE);
}

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  // @add-zone-rules-from-iana @FR3 @M4
  f.ScenarioOutline(
    "Future rule forms",
    ({ When, Then }, variables: Record<string, string>) => {
      let localTimeType: LocalTimeType;
      When("the future rule <rule> is evaluated at <instant>", () => {
        localTimeType = resolveFutureRule(
          readRule(variables.rule),
          toEpochSeconds(variables.instant),
        );
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

  // @add-zone-rules-from-iana @FR3 @M4
  f.Scenario(
    "Transitions are read in the local time in force",
    ({ Given, When, Then }) => {
      let rule: FutureRule;
      let offsetsSeconds: number[] = [];
      Given("the future rule {string}", (_ctx, ruleText: string) => {
        rule = readRule(ruleText);
      });
      When(
        "it is evaluated one second before and at {string}",
        (_ctx, instant: string) => {
          const transitionSeconds = toEpochSeconds(instant);
          offsetsSeconds = [transitionSeconds - 1, transitionSeconds].map(
            (epochSeconds) =>
              resolveFutureRule(rule, epochSeconds).utcOffsetSeconds,
          );
        },
      );
      Then(
        "the offsets are {string} and then {string}",
        (_ctx, before: string, after: string) => {
          expect(offsetsSeconds).toEqual([
            readOffsetSeconds(before),
            readOffsetSeconds(after),
          ]);
        },
      );
    },
  );

  // @add-zone-rules-from-iana @FR3 @M4
  f.ScenarioOutline(
    "Julian day forms",
    ({ When, Then }, variables: Record<string, string>) => {
      let offsetSeconds = 0;
      When("the future rule <rule> is evaluated at <instant>", () => {
        offsetSeconds = resolveFutureRule(
          readRule(variables.rule),
          toEpochSeconds(variables.instant),
        ).utcOffsetSeconds;
      });
      Then("the offset is <offset>", () => {
        expect(offsetSeconds).toBe(readOffsetSeconds(variables.offset));
      });
    },
  );
});
