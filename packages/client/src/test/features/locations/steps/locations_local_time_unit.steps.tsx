import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen, within } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import {
  LOCAL_DATE_FORMAT_OPTIONS,
  LOCAL_TIME_FORMAT_OPTIONS,
} from "@/constants";
import type { SupportedLanguage } from "@/i18n";
import { Temporal } from "@/lib/temporal";
import type { LocationRow } from "@/presenter";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { startWorkCount, type WorkCount } from "@/test/workCounters";
import {
  createLocalTimeWorld,
  ENGLISH_LANGUAGE,
  RUSSIAN_LANGUAGE,
} from "./localTimeWorld";
import {
  BUDGET_ROW_COUNT,
  BUDGET_SECOND_MOMENT,
  buildBudgetLocations,
  expectNoWarmWork,
  presentBudgetRows,
} from "./rowBudgetWorld";

const feature = await loadFeature("../locations_local_time_unit.feature");

const LABEL_CITIES = ["Kolkata", "Kathmandu", "New York"];
const LABEL_LANGUAGES: SupportedLanguage[] = [
  ENGLISH_LANGUAGE,
  RUSSIAN_LANGUAGE,
];
const UNKNOWN_ZONE_LABEL = "Olympus";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createLocalTimeWorld();
  let budgetLocations: ReturnType<typeof buildLocation>[];
  let budgetInstant: string;
  let workCount: WorkCount;
  let presentedByLanguage: [SupportedLanguage, LocationRow[]][];

  f.BeforeEachScenario(world.reset);
  f.AfterEachScenario(() => workCount?.stop());
  f.AfterAllScenarios(world.finish);

  const givenInstant = (_ctx: unknown, timestamp: string) => {
    world.setInstant(timestamp);
    budgetInstant = timestamp;
  };
  const givenList = (_ctx: unknown, cities: string) =>
    world.setStoredCities(cities);
  const whenOpens = () => world.openApp();
  const thenShowsTimeAndDate = (
    _ctx: unknown,
    city: string,
    time: string,
    date: string,
  ) => world.expectRowShowsTimeAndDate(city, time, date);
  const thenShowsTime = (_ctx: unknown, city: string, time: string) =>
    expect(world.timeOf(city)).toBe(time);
  const thenShowsDateWithIso = (
    _ctx: unknown,
    city: string,
    time: string,
    date: string,
    isoDate: string,
  ) => {
    world.expectRowShowsTimeAndDate(city, time, date);
    expect(world.dateElementOf(city)).toHaveAttribute("datetime", isoDate);
  };

  // @show-local-time-and-date-on-location-cards @FR1 @FR2 @M2
  f.Scenario("Time and date of each location", ({ Given, And, When, Then }) => {
    Given("the interface language is English", async () => {
      await i18n.changeLanguage(ENGLISH_LANGUAGE);
    });
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    When("the user opens the app", whenOpens);
    Then(
      "the rows show:",
      (_ctx, table: { city: string; time: string; date: string }[]) => {
        for (const { city, time, date } of table) {
          world.expectRowShowsTimeAndDate(city, time, date);
        }
      },
    );
    And("every date carries the ISO date {string}", (_ctx, isoDate: string) => {
      const dateElements = screen
        .getAllByRole("listitem")
        .map((row) => row.querySelector("time"));
      expect(dateElements).toHaveLength(4);
      for (const dateElement of dateElements) {
        expect(dateElement).toHaveAttribute("datetime", isoDate);
      }
    });
  });

  // @show-local-time-and-date-on-location-cards @FR1 @FR2 @M2
  f.Scenario(
    "Zones on both sides of midnight",
    ({ Given, And, When, Then }) => {
      Given("the interface language is English", async () => {
        await i18n.changeLanguage(ENGLISH_LANGUAGE);
      });
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", whenOpens);
      Then(
        "the {string} row shows the time {string} and the date {string} with the ISO date {string}",
        thenShowsDateWithIso,
      );
      And(
        "the {string} row shows the time {string} and the date {string} with the ISO date {string}",
        thenShowsDateWithIso,
      );
    },
  );

  // @show-local-time-and-date-on-location-cards @FR2
  f.Scenario("Russian interface", ({ Given, And, When, Then }) => {
    Given("the interface language is Russian", async () => {
      await i18n.changeLanguage(RUSSIAN_LANGUAGE);
    });
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    When("the user opens the app", whenOpens);
    Then(
      "the {string} row shows the time {string} and the date {string}",
      thenShowsTimeAndDate,
    );
  });

  // @show-local-time-and-date-on-location-cards @FR5
  f.Scenario(
    "Time is computed again when the list changes",
    ({ Given, And, When, Then }) => {
      Given("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", whenOpens);
      Then("the {string} row shows the time {string}", thenShowsTime);
      When("the current instant becomes {string}", givenInstant);
      And("the user adds {string}", (_ctx, city: string) =>
        world.addCity(city),
      );
      Then(
        "the rows show the times:",
        (_ctx, table: { city: string; time: string }[]) => {
          for (const { city, time } of table)
            expect(world.timeOf(city)).toBe(time);
        },
      );
    },
  );

  // @show-local-time-and-date-on-location-cards @FR6
  f.Scenario("Time that cannot be computed", ({ Given, And, When, Then }) => {
    Given("the current instant is {string}", givenInstant);
    And(
      "the list holds {string} and a location in the zone {string}",
      (_ctx, city: string, timeZoneId: string) => {
        world.setStoredLocations([
          buildLocation({ label: city, timeZoneId: "Europe/Moscow" }),
          buildLocation({ label: UNKNOWN_ZONE_LABEL, timeZoneId }),
        ]);
      },
    );
    When("the user opens the app", whenOpens);
    Then(
      "the {string} row shows no time and date but keeps its remove action",
      (_ctx, city: string) => {
        const row = world.rowOf(city);
        expect(row.querySelector("time")).toBeNull();
        expect(
          within(row).getByRole("button", {
            name: i18n.t("locations.removeLocation", { city }),
          }),
        ).toBeVisible();
      },
    );
    And(
      "the {string} row shows the time {string} and the date {string}",
      thenShowsTimeAndDate,
    );
  });

  // @show-local-time-and-date-on-location-cards @NFR-P1
  // @replace-wall-clock-row-budgets-with-deterministic-checks @FR1
  f.Scenario("50 rows within the budget", ({ Given, When, Then }) => {
    Given(
      "{int} locations whose rows have been presented with time and date once",
      (_ctx, count: number) => {
        expect(count).toBe(BUDGET_ROW_COUNT);
        budgetLocations = buildBudgetLocations(count);
        presentBudgetRows(budgetLocations);
      },
    );
    When("their rows are presented with time and date again", () => {
      workCount = startWorkCount();
      presentBudgetRows(budgetLocations, { timestamp: BUDGET_SECOND_MOMENT });
      workCount.stop();
    });
    Then("no date, time or region name formatter is built", () => {
      expectNoWarmWork(workCount);
    });
  });

  // @replace-wall-clock-row-budgets-with-deterministic-checks @FR5 @UX1
  f.Scenario(
    "Labels are unchanged by formatter reuse",
    ({ Given, When, Then }) => {
      Given("the list contains Kolkata, Kathmandu and New York", () => {
        budgetLocations = LABEL_CITIES.map((label) =>
          buildLocation({ label, ...KNOWN_CITIES[label] }),
        );
      });
      When(
        "their rows are presented at {string} in English and then in Russian",
        (_ctx, timestamp: string) => {
          budgetInstant = timestamp;
          presentedByLanguage = LABEL_LANGUAGES.map((language) => [
            language,
            presentBudgetRows(budgetLocations, { timestamp, language }),
          ]);
        },
      );
      Then(
        "each row shows the same time and date labels as the platform's own date formatting gives for that zone",
        () => {
          for (const [language, rows] of presentedByLanguage) {
            rows.forEach((row, index) => {
              const platformDateTime = Temporal.Instant.from(
                budgetInstant,
              ).toZonedDateTimeISO(budgetLocations[index].timeZoneId);
              expect(row.localTimeLabel).toBe(
                platformDateTime.toLocaleString(
                  language,
                  LOCAL_TIME_FORMAT_OPTIONS,
                ),
              );
              expect(row.localDateLabel).toBe(
                platformDateTime.toLocaleString(
                  language,
                  LOCAL_DATE_FORMAT_OPTIONS,
                ),
              );
            });
          }
        },
      );
    },
  );
});
