// Verifies FR1, FR2, FR3, FR4, M1 of show-zone-abbreviations-and-zone-label-setting.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen } from "@testing-library/react/pure";
import { expect, vi } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getZoneAbbreviation, getZoneAbbreviations } from "@/model";
import { createZoneLineWorld } from "../../locations/steps/zoneLineWorld";

const feature = await loadFeature("../zone_abbreviations_unit.feature");
const PAIR_SEPARATOR = ", ";
const RUSSIAN_LANGUAGE = "ru";
const ENGLISH_LANGUAGE = "en";

const abbreviationAt = (zone: string, instant: string) => {
  try {
    return getZoneAbbreviation(
      zone,
      Temporal.Instant.from(instant).toZonedDateTimeISO(zone),
    );
  } catch (e) {
    if (e instanceof RangeError) return undefined;
    throw e;
  }
};

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createZoneLineWorld();
  let readAbbreviations: (string | undefined)[] = [];
  let readPair: readonly string[] = [];
  let fetchSpy: ReturnType<typeof vi.fn>;

  f.BeforeEachScenario(async () => {
    await world.reset();
    readAbbreviations = [];
    fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
  });
  f.AfterAllScenarios(async () => {
    vi.unstubAllGlobals();
    await world.finish();
  });

  const whenAbbreviationRead = (
    _ctx: unknown,
    zone: string,
    instant: string,
  ) => {
    readAbbreviations = [abbreviationAt(zone, instant)];
  };
  const thenItIs = (_ctx: unknown, expected: string) =>
    expect(readAbbreviations).toEqual([expected]);
  const thenThereIsNone = () => expect(readAbbreviations).toEqual([undefined]);
  const givenInstant = (_ctx: unknown, instant: string) =>
    world.setInstant(instant);
  const givenList = (_ctx: unknown, ...cities: string[]) =>
    world.setList(cities.join(PAIR_SEPARATOR));
  const showList = () => world.open();
  const expectRowShows = (_ctx: unknown, city: string, text: string) =>
    expect(world.zoneLineOf(city)).toContain(text);

  // @show-zone-abbreviations-and-zone-label-setting @FR2 @M1
  f.ScenarioOutline(
    "The abbreviation follows the moment",
    ({ When, Then }, variables) => {
      When('the zone abbreviation of "<zone>" at "<instant>" is read', () =>
        whenAbbreviationRead(undefined, variables.zone, variables.instant),
      );
      Then('it is "<abbreviation>"', () =>
        thenItIs(undefined, variables.abbreviation),
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR2
  f.Scenario(
    "The abbreviation changes at the clock change",
    ({ Given, When, Then }) => {
      Given(
        "New York moves its clocks forward at {string}",
        (_ctx, transition: string) => {
          const zone = "America/New_York";
          const before = Temporal.Instant.from(transition).subtract({
            seconds: 1,
          });
          expect(
            before.toZonedDateTimeISO(zone).offsetNanoseconds,
          ).toBeLessThan(
            Temporal.Instant.from(transition).toZonedDateTimeISO(zone)
              .offsetNanoseconds,
          );
        },
      );
      When(
        "the zone abbreviation of {string} is read at {string} and at {string}",
        (_ctx, zone: string, first: string, second: string) => {
          readAbbreviations = [
            abbreviationAt(zone, first),
            abbreviationAt(zone, second),
          ];
        },
      );
      Then(
        "it is {string} and then {string}",
        (_ctx, first: string, second: string) =>
          expect(readAbbreviations).toEqual([first, second]),
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR1
  f.ScenarioOutline(
    "Numeric designations are no abbreviation",
    ({ When, Then }, variables) => {
      When(
        'the zone abbreviation of "<zone>" at {string} is read',
        (_ctx, instant: string) =>
          whenAbbreviationRead(undefined, variables.zone, instant),
      );
      Then("there is none", thenThereIsNone);
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR1
  f.Scenario("Unknown zone", ({ When, Then }) => {
    When(
      "the zone abbreviation of {string} at {string} is read",
      whenAbbreviationRead,
    );
    Then("there is none", thenThereIsNone);
  });

  // @show-zone-abbreviations-and-zone-label-setting @FR1
  f.ScenarioOutline("Abbreviation pairs", ({ When, Then }, variables) => {
    When('the abbreviation pair of "<zone>" is read', () => {
      readPair = getZoneAbbreviations(variables.zone);
    });
    Then('it is "<pair>"', () =>
      expect(readPair.join(PAIR_SEPARATOR)).toBe(variables.pair),
    );
  });

  // @show-zone-abbreviations-and-zone-label-setting @FR4
  f.Scenario(
    "Available on the first render offline",
    ({ Given, And, When, Then }) => {
      Given("the app is opened without a network connection", () => {
        fetchSpy.mockRejectedValue(new TypeError("offline"));
      });
      And(
        "the list contains {string} and the current instant is {string}",
        (_ctx, city: string, instant: string) => {
          world.setList(city);
          world.setInstant(instant);
        },
      );
      When("the list is first shown", showList);
      Then(
        "the {string} row shows {string} in the same render, without a loading state",
        (_ctx, city: string, text: string) => {
          expect(world.zoneLineOf(city)).toContain(text);
          expect(screen.queryByRole("progressbar")).toBeNull();
          expect(document.querySelector("[aria-busy='true']")).toBeNull();
        },
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR3 @M1
  f.Scenario("Moscow in Russian and English", ({ Given, And, When, Then }) => {
    Given("the current instant is {string}", givenInstant);
    And("the list contains {string}", (_ctx, city: string) => {
      givenList(undefined, city);
      showList();
    });
    When("the interface language is Russian", () =>
      world.setLanguage(RUSSIAN_LANGUAGE),
    );
    Then('the "Moscow" row shows "МСК"', () =>
      expectRowShows(undefined, "Moscow", "МСК"),
    );
    When("the interface language is English", () =>
      world.setLanguage(ENGLISH_LANGUAGE),
    );
    Then('the "Moscow" row shows "MSK"', () =>
      expectRowShows(undefined, "Moscow", "MSK"),
    );
  });

  // @show-zone-abbreviations-and-zone-label-setting @FR3 @M1
  f.Scenario(
    "Other abbreviations stay Latin in Russian",
    ({ Given, And, When, Then }) => {
      Given("the interface language is Russian", () =>
        world.setLanguage(RUSSIAN_LANGUAGE),
      );
      And("the current instant is {string}", givenInstant);
      And("the list contains {string} and {string}", givenList);
      When("the list is shown", showList);
      Then(
        "{string} shows {string} and {string} shows {string}",
        (
          _ctx,
          first: string,
          firstText: string,
          second: string,
          secondText: string,
        ) => {
          expectRowShows(undefined, first, firstText);
          expectRowShows(undefined, second, secondText);
        },
      );
    },
  );
});
