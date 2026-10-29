// Verifies FR8, FR9, FR12, NFR-P1, NFR-P2 of show-here-entry-for-device-time.

import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, screen, waitFor, within } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import {
  restoreZoneData,
  startOnOutdatedZoneData,
} from "../../browser_compatibility/steps/legacyZoneWorld";
import { createHereEntryChecks, expectSuggestions } from "./hereEntryChecks";
import {
  createWarmHereEntryCheck,
  presentHereEntryOnEngine,
} from "./hereEntryEngineWorld";
import { createHereEntryWorld, DataMode } from "./hereEntryWorld";

const feature = await loadFeature("../locations_here_entry_data_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createHereEntryWorld();
  const { expectNoHereEntry, expectHereEntryShows } =
    createHereEntryChecks(world);
  const warmCheck = createWarmHereEntryCheck();
  let engineResult: Awaited<ReturnType<typeof presentHereEntryOnEngine>>;
  let engine: Awaited<ReturnType<typeof startOnOutdatedZoneData>>;

  const expectHereEntryCity = (_ctx: unknown, city: string) =>
    expectHereEntryShows(city);

  f.BeforeEachScenario(world.reset);
  f.AfterEachScenario(() => {
    warmCheck.stop();
    restoreZoneData();
  });
  f.AfterAllScenarios(async () => {
    cleanup();
    await i18n.changeLanguage("ru");
  });

  // @show-here-entry-for-device-time @FR8 @NFR-P2 @UX3
  f.Scenario(
    "Derived city first, exemplar city after loading",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", world.givenDeviceZone);
      And("the interface language is {string}", world.givenLanguage);
      And(
        "the zone cities data has not been loaded",
        world.givenData(DataMode.HELD),
      );
      When("the user opens the app", world.openApp);
      Then(
        "the Here entry shows the derived city {string}",
        expectHereEntryCity,
      );
      When(
        "the zone cities data finishes loading",
        world.whenDataFinishesLoading,
      );
      Then(
        "the Here entry shows the exemplar city {string}",
        expectHereEntryCity,
      );
    },
  );

  // @show-here-entry-for-device-time @FR8
  f.Scenario("Loading fails", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", world.givenDeviceZone);
    And(
      "loading the zone cities data fails",
      world.givenData(DataMode.FAILING),
    );
    When("the user opens the app", world.openApp);
    Then("the Here entry shows the derived city {string}", expectHereEntryCity);
    And("no error is shown", async () => {
      await waitFor(() => expect(world.getDataRequests()).toBe(1));
      expect(screen.queryByRole("alert")).toBeNull();
    });
  });

  // @show-here-entry-for-device-time @FR8 @NFR-P2
  f.Scenario("No load without a Here entry", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", world.givenDeviceZone);
    And("the list is {string}", world.givenList);
    When("the user opens the app and does not open the search", world.openApp);
    Then("the zone cities data is not requested", () =>
      expect(world.getDataRequests()).toBe(0),
    );
  });

  // @show-here-entry-for-device-time @FR8 @NFR-P2
  f.Scenario(
    "The search reuses the Here entry's data",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", world.givenDeviceZone);
      And("the list is {string}", world.givenList);
      When(
        "the user opens the app, the zone cities data finishes loading, and the user opens the search",
        async () => {
          world.givenData(DataMode.HELD)();
          await world.openApp();
          await world.whenDataFinishesLoading();
          await world.whenOpensSearch();
        },
      );
      Then("the suggestions are shown", expectSuggestions);
      And("the zone cities data was requested exactly once", () =>
        expect(world.getDataRequests()).toBe(1),
      );
    },
  );

  // @show-here-entry-for-device-time @FR9
  f.Scenario("Unreadable stored list", ({ Given, When, Then, And }) => {
    Given("the stored location list is unreadable", world.givenUnreadableList);
    When("the user opens the app", world.openApp);
    Then("the load error with Reset is shown", () => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(i18n.t("locations.loadError"));
      expect(
        within(alert).getByRole("button", { name: i18n.t("locations.reset") }),
      ).toBeVisible();
    });
    And("no Here entry is shown", expectNoHereEntry);
    And("the zone cities data is not requested", () =>
      expect(world.getDataRequests()).toBe(0),
    );
  });

  // @show-here-entry-for-device-time @FR9
  f.Scenario("Storage unavailable", ({ Given, And, When, Then }) => {
    Given("storage is unavailable", () => undefined);
    And("the device time zone is {string}", world.givenDeviceZone);
    When("the user opens the app", world.openAppShell);
    Then("the storage warning is shown", () =>
      expect(
        screen.getByText(i18n.t("mainPage.storageUnavailable")),
      ).toBeVisible(),
    );
    And("the Here entry for {string} is shown", (_ctx: unknown, zone: string) =>
      expect(world.hereEntry()).toHaveTextContent(world.formatOffsetOf(zone)),
    );
  });

  // @show-here-entry-for-device-time @FR12 @M7
  f.Scenario("Renamed device time zone", ({ Given, And, When, Then }) => {
    Given("the engine rejects {string} and accepts {string}", async () => {
      engine = await startOnOutdatedZoneData();
    });
    And("the device reports the time zone {string}", world.givenDeviceZone);
    And("the interface language is {string}", world.givenLanguage);
    And("the current instant is {string}", world.givenInstant);
    And("the list is {string}", world.givenList);
    When("the user opens the app", async () => {
      engineResult = await presentHereEntryOnEngine(engine.modules, {
        deviceTimeZone: world.getDeviceZone(),
        instant: world.getInstant(),
        listedCity: "Moscow",
      });
    });
    Then(
      "the Here entry shows {string}, the time {string} and the meta line {string}",
      (_ctx: unknown, city: string, time: string, meta: string) => {
        expect(engineResult.presented).toMatchObject({
          cityLabel: city,
          localTimeLabel: time,
          metaLabel: meta,
        });
      },
    );
    And(
      "the device time zone is kept as {string}",
      (_ctx: unknown, zone: string) =>
        expect(engineResult.deviceTimeZoneId).toBe(zone),
    );
  });

  // @show-here-entry-for-device-time @NFR-P1
  f.Scenario(
    "Presenting again builds no formatter",
    ({ Given, When, Then, And }) => {
      Given(
        "50 locations, none in the device time zone, have been presented with the Here entry",
        warmCheck.presentOnce,
      );
      When(
        "the same rows and the Here entry are presented again for the next minute tick",
        warmCheck.presentAgain,
      );
      Then("no formatter is built", warmCheck.expectNoFormatter);
      And(
        "the Here entry uses at most the transition lookups of one location row",
        warmCheck.expectHereEntryLookupsWithinRowBound,
      );
    },
  );
});
