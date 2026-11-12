// Verifies FR1, FR2, FR3, FR4, M1 of show-zone-abbreviations-and-zone-label-setting.

import zoneAbbreviationTable from "virtual:zone-abbreviations";
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen } from "@testing-library/react/pure";
import { expect, vi } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getZoneAbbreviation, getZoneAbbreviations } from "@/model";
import { committedRelease } from "@/test/installZoneRules";
import abbreviationsBefore from "@/test/zoneRules/fixtures/zone-abbreviations.before.json";
import abbreviationChanges from "@/test/zoneRules/fixtures/zone-abbreviations.changes.json";
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

  // @add-zone-rules-from-iana @FR9
  f.Scenario("Table built from the release", ({ When, Then, And }) => {
    When(
      "the abbreviation table is built from the zone rules release {string}",
      (_ctx, release: string) => {
        expect(committedRelease.release).toBe(release);
      },
    );
    Then(
      "{string} has the pair {string}, {string} has {string}, {string} has {string}",
      (
        _ctx,
        firstZone: string,
        firstPair: string,
        secondZone: string,
        secondPair: string,
        thirdZone: string,
        thirdPair: string,
      ) => {
        expect([
          zoneAbbreviationTable[firstZone]?.join(PAIR_SEPARATOR),
          zoneAbbreviationTable[secondZone]?.join(PAIR_SEPARATOR),
          zoneAbbreviationTable[thirdZone]?.join(PAIR_SEPARATOR),
        ]).toEqual([firstPair, secondPair, thirdPair]);
      },
    );
    And("{string} has no abbreviation", (_ctx, zone: string) => {
      expect(zoneAbbreviationTable[zone]).toBeUndefined();
    });
  });

  // @add-zone-rules-from-iana @FR9
  f.Scenario(
    "Abbreviations kept from the table before",
    ({ Given, When, Then, And }) => {
      let differingZoneIds: string[] = [];
      Given("the abbreviation table built before this change", () => {
        expect(Object.keys(abbreviationsBefore).length).toBeGreaterThan(0);
      });
      When(
        "it is compared with the table built from the zone rules release {string}",
        () => {
          differingZoneIds = Object.entries(abbreviationsBefore)
            .filter(
              ([zoneId, abbreviations]) =>
                JSON.stringify(zoneAbbreviationTable[zoneId]) !==
                JSON.stringify(abbreviations),
            )
            .map(([zoneId]) => zoneId);
        },
      );
      Then(
        "every zone of the earlier table has the same abbreviations in both",
        () => {
          const unchangedZoneIds = differingZoneIds.filter(
            (zoneId) => !(zoneId in abbreviationChanges),
          );
          expect(unchangedZoneIds).toEqual([]);
        },
      );
      And(
        "the only exceptions are zones whose designations an IANA release note changed, each listed with that release",
        () => {
          for (const zoneId of Object.keys(abbreviationChanges)) {
            expect(differingZoneIds).toContain(zoneId);
          }
        },
      );
    },
  );
});
