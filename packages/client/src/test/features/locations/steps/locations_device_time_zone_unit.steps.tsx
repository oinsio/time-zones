import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the page must survive between steps.
import { act, cleanup, render, screen } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import {
  createInMemoryLocationBackend,
  createInMemoryLocationRepository,
} from "@/adapters";
import { LocationsProvider, useLocations } from "@/controller";
import { type Clock, fakeClock } from "@/lib/temporal";
import en from "@/locales/en.json";
import ru from "@/locales/ru.json";
import { LocationsLoadStatus } from "@/ports";
import { presentLocationRows } from "@/presenter";
import { buildLocation } from "@/test/factories/buildLocation";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import { LocationList } from "@/views/shared";
import { cityEntry } from "./locationsUiWorld";

const feature = await loadFeature("../locations_device_time_zone_unit.feature");

const INSTANT = "2026-07-15T12:00:00Z";
const ROW_BUDGET_MS = 50;
const BUDGET_ROW_COUNT = 50;
const BUDGET_MATCHING_ROW_COUNT = 10;
const CITY_SEPARATOR = ", ";
const RUSSIAN_LANGUAGE = "ru";
const ENGLISH_LANGUAGE = "en";
const DEFAULT_DEVICE_ZONE = "UTC";

type LocationsHandle = ReturnType<typeof useLocations>;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let deviceZone: string;
  let storedCities: string[];
  let latestLocations: LocationsHandle;
  let backend: ReturnType<typeof createInMemoryLocationBackend>;
  let budgetLocations: ReturnType<typeof buildLocation>[];
  let elapsedMs: number;

  const switchableClock: Clock = {
    ...fakeClock(INSTANT),
    timeZoneId: () => deviceZone,
  };

  const openApp = () => {
    backend = createInMemoryLocationBackend({
      status: LocationsLoadStatus.LOADED,
      locations: storedCities.map((city) => buildLocation(cityEntry(city))),
    });
    const Rows = () => {
      latestLocations = useLocations();
      return (
        <LocationList
          rows={latestLocations.rows}
          onRemove={latestLocations.removeLocation}
          onMove={latestLocations.moveLocation}
        />
      );
    };
    render(
      <LocationsProvider
        repository={createInMemoryLocationRepository({ backend })}
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

  const badgeText = (language: string) =>
    language === RUSSIAN_LANGUAGE
      ? ru.locations.deviceTimeZoneBadge
      : en.locations.deviceTimeZoneBadge;

  const expectRowShows = (city: string, text: string) =>
    expect(rowOf(city)).toHaveTextContent(text);

  f.BeforeEachScenario(async () => {
    cleanup();
    deviceZone = DEFAULT_DEVICE_ZONE;
    storedCities = [];
    await i18n.changeLanguage(ENGLISH_LANGUAGE);
  });
  f.AfterAllScenarios(async () => {
    cleanup();
    await i18n.changeLanguage(RUSSIAN_LANGUAGE);
  });

  const givenDeviceZone = (_ctx: unknown, zone: string) => {
    deviceZone = zone;
  };
  const givenList = (_ctx: unknown, cities: string) => {
    storedCities = cities.split(CITY_SEPARATOR);
  };
  const givenLanguage = async (_ctx: unknown, language: string) => {
    await i18n.changeLanguage(language);
  };
  const thenShowsBadge = (_ctx: unknown, city: string) =>
    expectRowShows(city, badgeText(ENGLISH_LANGUAGE));
  const thenShowsNoBadge = (_ctx: unknown, city: string) =>
    expect(rowOf(city)).not.toHaveTextContent(badgeText(ENGLISH_LANGUAGE));
  const thenNoBadgeAnywhere = () =>
    expect(screen.queryByText(badgeText(ENGLISH_LANGUAGE))).toBeNull();
  const whenAdds = (_ctx: unknown, city: string) => {
    act(() => {
      latestLocations.addLocation(cityEntry(city));
    });
  };
  const whenRemoves = (_ctx: unknown, city: string) => {
    act(() => {
      latestLocations.removeLocation(buildLocation(cityEntry(city)).id);
    });
  };

  // @mark-device-time-zone-in-location-list @FR1
  f.Scenario("One row matches", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("the {string} row shows the badge", thenShowsBadge);
    And("the {string} row shows no badge", thenShowsNoBadge);
  });

  // @mark-device-time-zone-in-location-list @FR2
  f.Scenario("No row matches", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("no row shows the badge", thenNoBadgeAnywhere);
  });

  // @mark-device-time-zone-in-location-list @FR2
  f.Scenario("Several rows match", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("the {string} row shows the badge", thenShowsBadge);
    And("the {string} row shows the badge", thenShowsBadge);
    And("the {string} row shows no badge", thenShowsNoBadge);
  });

  // @mark-device-time-zone-in-location-list @FR3
  f.Scenario("Legacy device identifier", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("the {string} row shows the badge", thenShowsBadge);
    And("the {string} row shows no badge", thenShowsNoBadge);
  });

  // @mark-device-time-zone-in-location-list @FR3
  f.Scenario("Unknown device identifier", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("the {string} row shows the badge", thenShowsBadge);
    And("the {string} row shows no badge", thenShowsNoBadge);
  });

  // @mark-device-time-zone-in-location-list @FR4
  f.Scenario("Badge follows changes of the list", (steps) => {
    const { Given, And, When, Then } = steps;
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    And("the user adds {string}", whenAdds);
    Then("the {string} row shows the badge", thenShowsBadge);
    When("the user removes {string}", whenRemoves);
    Then("no row shows the badge", thenNoBadgeAnywhere);
  });

  // @mark-device-time-zone-in-location-list @FR3
  f.Scenario("Device zone is read once", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    And("the device time zone becomes {string}", givenDeviceZone);
    And("the user adds {string}", whenAdds);
    Then("the {string} row shows the badge", thenShowsBadge);
    And("the {string} row shows no badge", thenShowsNoBadge);
  });

  // @mark-device-time-zone-in-location-list @FR3
  f.Scenario("Device zone is not stored", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    And("the user adds {string}", whenAdds);
    Then("the stored list document holds only the locations", () => {
      expect(Object.keys(backend.document).sort()).toEqual([
        "locations",
        "status",
      ]);
    });
  });

  // @mark-device-time-zone-in-location-list @FR5
  f.Scenario("English interface", ({ Given, And, When, Then }) => {
    Given("the interface language is {string}", givenLanguage);
    And("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("the {string} row shows {string}", (_ctx, city: string, text) =>
      expectRowShows(city, text),
    );
  });

  // @mark-device-time-zone-in-location-list @FR5
  f.Scenario("Russian interface", ({ Given, And, When, Then }) => {
    Given("the interface language is {string}", givenLanguage);
    And("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then(
      "the {string} row shows the Russian badge text",
      (_ctx, city: string) => expectRowShows(city, badgeText(RUSSIAN_LANGUAGE)),
    );
  });

  // @mark-device-time-zone-in-location-list @NFR-P1
  f.Scenario("50 rows within the budget", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("50 locations of which some are in the device time zone", () => {
      budgetLocations = Array.from({ length: BUDGET_ROW_COUNT }, (_, index) =>
        buildLocation({
          label: `City ${index}`,
          timeZoneId:
            index < BUDGET_MATCHING_ROW_COUNT ? deviceZone : "Asia/Tokyo",
        }),
      );
    });
    When("their rows are presented", () => {
      const startedAt = performance.now();
      presentLocationRows(budgetLocations, {
        language: ENGLISH_LANGUAGE,
        instant: switchableClock.instant(),
        translate: i18n.getFixedT(ENGLISH_LANGUAGE),
        deviceTimeZoneId: deviceZone,
      });
      elapsedMs = performance.now() - startedAt;
    });
    Then("it takes at most {int} ms", (_ctx, budgetMs: number) => {
      expect(budgetMs).toBe(ROW_BUDGET_MS);
      expect(elapsedMs).toBeLessThanOrEqual(budgetMs);
    });
  });
});
