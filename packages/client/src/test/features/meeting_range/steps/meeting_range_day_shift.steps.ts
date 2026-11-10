// Verifies FR8 of add-grid-meeting-range-and-share.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import { DayShift, getDayShift } from "@/model";
import { KNOWN_CITIES } from "@/test/factories/buildLocation";

const feature = await loadFeature("../meeting_range_day_shift.feature");

const SHIFTS: Record<string, DayShift> = {
  same: DayShift.SAME,
  earlier: DayShift.EARLIER,
  later: DayShift.LATER,
};

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let referenceZone = "";
  let shift: DayShift;

  // @add-grid-meeting-range-and-share @FR8
  f.ScenarioOutline(
    "Day shifts at the start of the sample meeting",
    ({ Given, When, Then }, variables) => {
      Given("the reference zone is {string}", (_ctx, zone: string) => {
        referenceZone = zone;
      });
      When(
        "the day shift at {string} is read for <city>",
        (_ctx, instant: string) => {
          shift = getDayShift(
            KNOWN_CITIES[variables.city].timeZoneId,
            Temporal.Instant.from(instant),
            referenceZone,
          );
        },
      );
      Then("it is <shift>", () => {
        expect(shift).toBe(SHIFTS[variables.shift]);
      });
    },
  );
});
