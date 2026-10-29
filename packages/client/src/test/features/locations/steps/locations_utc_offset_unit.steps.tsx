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
import { UNIT_TEST_DEVICE_TIME_ZONE } from "@/test/deviceTimeZone";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { startWorkCount, type WorkCount } from "@/test/workCounters";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationList } from "@/views/shared";
import { cityEntry } from "./locationsUiWorld";
import {
  BUDGET_ROW_COUNT,
  BUDGET_SECOND_MOMENT,
  buildBudgetLocations,
  presentBudgetRows,
} from "./rowBudgetWorld";

const feature = await loadFeature("../locations_utc_offset_unit.feature");

const UNKNOWN_ZONE_LABEL = "Olympus";
const RUSSIAN_LANGUAGE = "ru";
const ENGLISH_LANGUAGE = "en";
const HIDDEN_FROM_TEXT_SELECTOR =
  "[data-hour-label],[data-offset-difference],[aria-haspopup]";

type LocationsHandle = ReturnType<typeof useLocations>;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let currentClock: Clock;
  let switchableClock: Clock;
  let latestLocations: LocationsHandle;
  let storedLocations: ReturnType<typeof buildLocation>[];
  let workCount: WorkCount;

  const buildKnownLocation = (label: string) =>
    buildLocation({ ...cityEntry(label) });

  const setInstant = (instant: string) => {
    currentClock = fakeClock(instant, UNIT_TEST_DEVICE_TIME_ZONE);
  };

  const openApp = () => {
    const Rows = () => {
      latestLocations = useLocations();
      return (
        <LocationList
          rows={latestLocations.rows}
          onRemove={latestLocations.removeLocation}
          onSetHome={latestLocations.setHomeLocation}
          onMove={latestLocations.moveLocation}
          onSelectTrackFraction={() => undefined}
          onMoveTrack={() => undefined}
        />
      );
    };
    render(
      <LocationsProvider
        repository={createInMemoryLocationRepository({
          initialDocument: {
            status: LocationsLoadStatus.LOADED,
            locations: storedLocations,
            homeLocationId: null,
          },
        })}
        writeScheduler={immediateWriteScheduler}
        clock={switchableClock}
      >
        <Rows />
      </LocationsProvider>,
    );
  };

  const textWithoutHourLabels = (card: HTMLElement) => {
    const copy = card.cloneNode(true) as HTMLElement;
    for (const label of copy.querySelectorAll(HIDDEN_FROM_TEXT_SELECTOR)) {
      label.remove();
    }
    return copy.textContent;
  };
  const rowOf = (city: string) =>
    screen
      .getByRole("button", {
        name: i18n.t("locations.locationMenu", { city }),
      })
      .closest("li") as HTMLElement;

  const expectRowShows = (city: string, offset: string) =>
    expect(rowOf(city)).toHaveTextContent(offset);

  const containList = (_ctx: unknown, ...cities: string[]) => {
    storedLocations = cities.map(buildKnownLocation);
  };

  f.AfterEachScenario(() => workCount?.stop());

  f.BeforeEachScenario(async () => {
    cleanup();
    storedLocations = [];
    currentClock = fakeClock(
      "2026-07-15T12:00:00Z",
      UNIT_TEST_DEVICE_TIME_ZONE,
    );
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
    Then(
      "the {string} row shows {string}",
      (_ctx, city: string, offset: string) =>
        // exact text: the city label "UTC" alone must not satisfy the offset check
        expect(textWithoutHourLabels(rowOf(city))).toBe(
          `${city}${offset}12:00Wed, Jul 15`,
        ),
    );
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
            name: i18n.t("locations.locationMenu", { city }),
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
  // @replace-wall-clock-row-budgets-with-deterministic-checks @FR1
  f.Scenario("50 rows within the budget", ({ Given, When, Then, And }) => {
    Given(
      "{int} locations whose rows have been presented with offsets once",
      (_ctx, count: number) => {
        expect(count).toBe(BUDGET_ROW_COUNT);
        storedLocations = buildBudgetLocations(count);
        presentBudgetRows(storedLocations);
      },
    );
    When(
      "their rows are presented with offsets again at another minute of the same day",
      () => {
        workCount = startWorkCount();
        presentBudgetRows(storedLocations, { timestamp: BUDGET_SECOND_MOMENT });
        workCount.stop();
      },
    );
    Then("no date, time or region name formatter is built", () => {
      expect(workCount.formatters()).toBe(0);
      expect(workCount.displayNames()).toBe(0);
    });
    And("no time zone transition is looked up", () => {
      expect(workCount.transitionLookups()).toBe(0);
    });
  });
});
