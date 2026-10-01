import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the page must survive between steps.
import {
  act,
  cleanup,
  render,
  screen,
  within,
} from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import { LocationsProvider, useLocations } from "@/controller";
import { type Clock, fakeClock } from "@/lib/temporal";
import { LocationsLoadStatus } from "@/ports";
import { presentLocationRows } from "@/presenter";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationList } from "@/views/shared";
import { cityEntry } from "./locationsUiWorld";

const feature = await loadFeature("../locations_utc_offset_unit.feature");

const ROW_BUDGET_MS = 50;
const BUDGET_ROW_COUNT = 50;
const UNKNOWN_ZONE_LABEL = "Olympus";
const RUSSIAN_LANGUAGE = "ru";
const ENGLISH_LANGUAGE = "en";

type LocationsHandle = ReturnType<typeof useLocations>;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let currentClock: Clock;
  let switchableClock: Clock;
  let latestLocations: LocationsHandle;
  let storedLocations: ReturnType<typeof buildLocation>[];
  let elapsedMs: number;

  const buildKnownLocation = (label: string) =>
    buildLocation({ ...cityEntry(label) });

  const setInstant = (instant: string) => {
    currentClock = fakeClock(instant);
  };

  const openApp = () => {
    const Rows = () => {
      latestLocations = useLocations();
      return (
        <LocationList
          rows={latestLocations.rows}
          onRemove={latestLocations.removeLocation}
        />
      );
    };
    render(
      <LocationsProvider
        repository={createInMemoryLocationRepository({
          initialDocument: {
            status: LocationsLoadStatus.LOADED,
            locations: storedLocations,
          },
        })}
        writeScheduler={immediateWriteScheduler}
        clock={switchableClock}
      >
        <Rows />
      </LocationsProvider>,
    );
  };

  const rowOf = (city: string) =>
    screen
      .getByRole("button", {
        name: i18n.t("locations.removeLocation", { city }),
      })
      .closest("li") as HTMLElement;

  const expectRowShows = (city: string, offset: string) =>
    expect(rowOf(city)).toHaveTextContent(offset);

  const containList = (_ctx: unknown, ...cities: string[]) => {
    storedLocations = cities.map(buildKnownLocation);
  };

  f.BeforeEachScenario(async () => {
    cleanup();
    storedLocations = [];
    currentClock = fakeClock("2026-07-15T12:00:00Z");
    switchableClock = {
      instant: () => currentClock.instant(),
      plainDateISO: () => currentClock.plainDateISO(),
      timeZoneId: () => currentClock.timeZoneId(),
    };
    await i18n.changeLanguage(ENGLISH_LANGUAGE);
  });
  f.AfterAllScenarios(async () => {
    cleanup();
    await i18n.changeLanguage(RUSSIAN_LANGUAGE);
  });

  const givenInstant = (_ctx: unknown, instant: string) => setInstant(instant);
  const thenRowShows = (_ctx: unknown, city: string, offset: string) =>
    expectRowShows(city, offset);

  // @show-utc-offset-on-location-rows @FR1
  f.Scenario("Whole-hour zone", ({ Given, And, When, Then }) => {
    Given("the current instant is {string}", givenInstant);
    And("the list contains {string}", containList);
    When("the user opens the app", openApp);
    Then("the {string} row shows {string}", thenRowShows);
  });

  // @show-utc-offset-on-location-rows @FR2
  f.Scenario("Half-hour zone", ({ Given, And, When, Then }) => {
    Given("the current instant is {string}", givenInstant);
    And("the list contains {string}", containList);
    When("the user opens the app", openApp);
    Then("the {string} row shows {string}", thenRowShows);
  });

  // @show-utc-offset-on-location-rows @FR2
  f.Scenario("45-minute zone", ({ Given, And, When, Then }) => {
    Given("the current instant is {string}", givenInstant);
    And("the list contains {string}", containList);
    When("the user opens the app", openApp);
    Then("the {string} row shows {string}", thenRowShows);
  });

  // @show-utc-offset-on-location-rows @FR2 @UX2
  f.ScenarioOutline(
    "Daylight saving time is respected",
    ({ Given, And, When, Then }, variables) => {
      Given("the current instant is <instant>", () =>
        setInstant(variables.instant),
      );
      And("the list contains {string}", containList);
      When("the user opens the app", openApp);
      Then("the {string} row shows <offset>", (_ctx, city: string) =>
        expectRowShows(city, variables.offset),
      );
    },
  );

  // @show-utc-offset-on-location-rows @FR3
  f.Scenario("Zero offset", ({ Given, And, When, Then }) => {
    Given("the current instant is {string}", givenInstant);
    And("the list contains {string}", containList);
    When("the user opens the app", openApp);
    Then("the {string} row shows {string}", thenRowShows);
  });

  // @show-utc-offset-on-location-rows @FR4
  f.Scenario(
    "Offset is computed again when the list changes",
    ({ Given, And, When, Then }) => {
      Given("the list contains {string}", containList);
      And("the app was opened at {string}", (_ctx, instant: string) => {
        setInstant(instant);
        openApp();
      });
      When("the current instant becomes {string}", givenInstant);
      And("the user adds {string}", (_ctx, city: string) => {
        const { timeZoneId, countryCode } = KNOWN_CITIES[city] ?? {
          timeZoneId: "",
          countryCode: "",
        };
        act(() => {
          latestLocations.addLocation({ timeZoneId, label: city, countryCode });
        });
      });
      Then("the {string} row shows {string}", thenRowShows);
      And("the {string} row shows {string}", thenRowShows);
    },
  );

  // @show-utc-offset-on-location-rows @FR6
  f.Scenario("Offset that cannot be computed", ({ Given, And, When, Then }) => {
    Given("the current instant is {string}", givenInstant);
    And(
      "the list holds {string} and a location in the zone {string}",
      (_ctx, city: string, timeZoneId: string) => {
        storedLocations = [
          buildKnownLocation(city),
          buildLocation({ label: UNKNOWN_ZONE_LABEL, timeZoneId }),
        ];
      },
    );
    When("the user opens the app", openApp);
    Then(
      "the {string} row shows no offset but keeps its remove action",
      (_ctx, city: string) => {
        const row = rowOf(city);
        expect(row).not.toHaveTextContent(/UTC/);
        expect(
          within(row).getByRole("button", {
            name: i18n.t("locations.removeLocation", { city }),
          }),
        ).toBeVisible();
      },
    );
    And("the {string} row shows {string}", thenRowShows);
  });

  // @show-utc-offset-on-location-rows @FR5
  f.Scenario("Russian interface", ({ Given, And, When, Then }) => {
    Given("the interface language is Russian", async () => {
      await i18n.changeLanguage(RUSSIAN_LANGUAGE);
    });
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", containList);
    When("the user opens the app", openApp);
    Then(
      "the {string} row shows the Russian prefix followed by {string}",
      (_ctx, city: string, offset: string) =>
        expectRowShows(
          city,
          `${i18n.t("locations.utcOffsetPrefix", { lng: RUSSIAN_LANGUAGE })}${offset}`,
        ),
    );
  });

  // @show-utc-offset-on-location-rows @NFR-P1
  f.Scenario("50 rows within the budget", ({ Given, When, Then }) => {
    Given("{int} locations", (_ctx, count: number) => {
      storedLocations = Array.from({ length: count }, (_, index) =>
        buildLocation({ label: `City ${index}` }),
      );
      expect(storedLocations).toHaveLength(BUDGET_ROW_COUNT);
    });
    When("their rows are presented with offsets", () => {
      const startedAt = performance.now();
      presentLocationRows(storedLocations, {
        language: ENGLISH_LANGUAGE,
        instant: currentClock.instant(),
        translate: i18n.getFixedT(ENGLISH_LANGUAGE),
      });
      elapsedMs = performance.now() - startedAt;
    });
    Then("it takes at most {int} ms", (_ctx, budgetMs: number) => {
      expect(budgetMs).toBe(ROW_BUDGET_MS);
      expect(elapsedMs).toBeLessThanOrEqual(budgetMs);
    });
  });
});
