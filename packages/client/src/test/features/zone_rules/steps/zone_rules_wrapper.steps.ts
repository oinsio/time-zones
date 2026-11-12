// Implements FR6 of add-zone-rules-from-iana: executable scenarios of the Intl.DateTimeFormat wrapper.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { afterEach, expect, vi } from "vitest";
import { Temporal } from "@/lib/temporal";
import { realNativeDateTimeFormat } from "@/test/installZoneRules";
import {
  CLOCK_TIME_OPTIONS,
  createWrapper,
} from "@/test/zoneRules/wrapperWorld";

const feature = await loadFeature("../zone_rules_wrapper.feature");

const UNKNOWN_ZONE_ID = "Asia/Tokyo";
const toMilliseconds = (instant: string) =>
  Temporal.Instant.from(instant).epochMilliseconds;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let world = createWrapper();
  let text = "";
  let parts: Intl.DateTimeFormatPart[] = [];

  f.BeforeEachScenario(() => {
    world = createWrapper();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const readPart = (type: string) =>
    parts.find((part) => part.type === type)?.value;

  // @add-zone-rules-from-iana @FR6
  f.Scenario("Parts come from the rules", ({ Given, When, Then }) => {
    Given("the engine's own data places {string} at UTC+6", () => undefined);
    When(
      "{string} is split into parts in {string} with hour, minute, day, month and year",
      (_ctx, instant: string, zoneId: string) => {
        parts = new world.Wrapper("en", {
          timeZone: zoneId,
          hour: "numeric",
          minute: "2-digit",
          day: "numeric",
          month: "numeric",
          year: "numeric",
          hourCycle: "h23",
        }).formatToParts(toMilliseconds(instant));
      },
    );
    Then(
      "the hour part is {string}, the minute part {string}, the day {string}, the month {string} and the year {string}",
      (
        _ctx,
        hour: string,
        minute: string,
        day: string,
        month: string,
        year: string,
      ) => {
        expect(
          ["hour", "minute", "day", "month", "year"].map(readPart),
        ).toEqual([hour, minute, day, month, year]);
      },
    );
  });

  // @add-zone-rules-from-iana @FR6
  f.Scenario("Formatting in Russian keeps the locale", ({ When, Then }) => {
    When(
      "{string} is formatted in {string} for the {string} locale with the long date and the short time",
      (_ctx, instant: string, zoneId: string, locale: string) => {
        text = new world.Wrapper(locale, {
          timeZone: zoneId,
          dateStyle: "long",
          timeStyle: "short",
        }).format(toMilliseconds(instant));
      },
    );
    Then("the text reads {string}", (_ctx, expected: string) => {
      expect(text).toBe(expected);
    });
  });

  // @add-zone-rules-from-iana @FR6
  f.ScenarioOutline(
    "Zone names",
    ({ When, Then }, variables: Record<string, string>) => {
      When(
        "the timeZoneName of <zone> at 2026-07-15T12:00:00Z is formatted",
        () => {
          parts = new world.Wrapper("en", {
            timeZone: variables.zone,
            hour: "numeric",
            timeZoneName: "short",
          }).formatToParts(toMilliseconds("2026-07-15T12:00:00Z"));
        },
      );
      Then("it is <name>", () => {
        expect(readPart("timeZoneName")).toBe(variables.name);
      });
    },
  );

  // @add-zone-rules-from-iana @FR6
  f.ScenarioOutline(
    "Resolved options keep the requested id",
    ({ When, Then }, variables: Record<string, string>) => {
      let resolvedZoneId: string | undefined;
      When("a formatter for <requested> is created", () => {
        resolvedZoneId = new world.Wrapper("en", {
          timeZone: variables.requested,
        }).resolvedOptions().timeZone;
      });
      Then("its resolved timeZone is <resolved>", () => {
        expect(resolvedZoneId).toBe(variables.resolved);
      });
    },
  );

  // @add-zone-rules-from-iana @FR6
  f.Scenario("Unknown zones fall through", ({ When, Then }) => {
    When("a formatter for a zone the release does not know is created", () => {
      new world.Wrapper("en", {
        timeZone: UNKNOWN_ZONE_ID,
        ...CLOCK_TIME_OPTIONS,
      });
    });
    Then("the native constructor receives that zone unchanged", () => {
      expect(world.calls).toEqual([
        { timeZone: UNKNOWN_ZONE_ID, isRejected: false },
      ]);
    });
  });

  // @add-zone-rules-from-iana @FR6
  f.Scenario(
    "A formatter without a date formats the current instant",
    ({ Given, When, Then }) => {
      Given("the current instant is {string}", (_ctx, instant: string) => {
        const formatToParts = realNativeDateTimeFormat.prototype.formatToParts;
        vi.spyOn(
          realNativeDateTimeFormat.prototype,
          "formatToParts",
        ).mockImplementation(function (
          this: Intl.DateTimeFormat,
          date?: number | Date,
        ) {
          return formatToParts.call(this, date ?? toMilliseconds(instant));
        });
      });
      When(
        "a formatter for {string} with hour and minute formats without a date",
        (_ctx, zoneId: string) => {
          text = new world.Wrapper("en", {
            timeZone: zoneId,
            ...CLOCK_TIME_OPTIONS,
          }).format();
        },
      );
      Then("the text reads {string}", (_ctx, expected: string) => {
        expect(text).toBe(expected);
      });
    },
  );
});
