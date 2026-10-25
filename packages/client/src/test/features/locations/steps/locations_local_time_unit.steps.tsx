import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen, within } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import { fakeClock } from "@/lib/temporal";
import { presentLocationRows } from "@/presenter";
import { UNIT_TEST_DEVICE_TIME_ZONE } from "@/test/deviceTimeZone";
import { buildLocation } from "@/test/factories/buildLocation";
import {
  createLocalTimeWorld,
  ENGLISH_LANGUAGE,
  RUSSIAN_LANGUAGE,
} from "./localTimeWorld";

const feature = await loadFeature("../locations_local_time_unit.feature");

const ROW_BUDGET_MS = 50;
const BUDGET_ROW_COUNT = 50;
const UNKNOWN_ZONE_LABEL = "Olympus";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createLocalTimeWorld();
  let budgetLocations: ReturnType<typeof buildLocation>[];
  let budgetInstant: string;
  let elapsedMs: number;

  f.BeforeEachScenario(world.reset);
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
  f.Scenario("50 rows within the budget", ({ Given, When, Then }) => {
    Given("{int} locations", (_ctx, count: number) => {
      budgetInstant = "2026-07-15T12:00:00Z";
      budgetLocations = Array.from({ length: count }, (_, index) =>
        buildLocation({ label: `City ${index}` }),
      );
      expect(budgetLocations).toHaveLength(BUDGET_ROW_COUNT);
    });
    When("their rows are presented with time and date", () => {
      const startedAt = performance.now();
      presentLocationRows(budgetLocations, {
        language: ENGLISH_LANGUAGE,
        instant: fakeClock(budgetInstant).instant(),
        translate: i18n.getFixedT(ENGLISH_LANGUAGE),
        deviceTimeZoneId: UNIT_TEST_DEVICE_TIME_ZONE,
      });
      elapsedMs = performance.now() - startedAt;
    });
    Then("it takes at most {int} ms", (_ctx, budgetMs: number) => {
      expect(budgetMs).toBe(ROW_BUDGET_MS);
      expect(elapsedMs).toBeLessThanOrEqual(budgetMs);
    });
  });
});
