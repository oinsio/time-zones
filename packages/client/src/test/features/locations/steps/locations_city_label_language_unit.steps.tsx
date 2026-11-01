// Verifies FR1, FR2, FR3, FR4, UX1, UX2 of show-city-labels-in-interface-language.

import zoneCities from "virtual:zone-cities";
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, cleanup, screen, waitFor } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect } from "vitest";
import { createCompositeCitySearch } from "@/adapters";
import { resolveCityNameLanguage } from "@/locales";
import { LocationsLoadStatus } from "@/ports";
import { DIALECT_REGISTRY } from "@/test/factories/localeFixtures";
import { createDeviceTimeWorld, DataMode } from "./deviceTimeWorld";

const feature = await loadFeature(
  "../locations_city_label_language_unit.feature",
);

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDeviceTimeWorld();
  let storedDocumentBeforeSwitches: unknown;
  let dialectCityLabel = "";

  const expectRowReads = async (_ctx: unknown, label: string) =>
    waitFor(() => expect(screen.getByText(label)).toBeInTheDocument());
  const switchLanguage = (language: string) => async () =>
    act(async () => {
      await i18n.changeLanguage(language);
    });
  const expectStoredHome = (_ctx: unknown, label: string) => {
    const document = world.getBackend().document;
    expect(document.status).toBe(LocationsLoadStatus.LOADED);
    if (document.status !== LocationsLoadStatus.LOADED) return;
    expect(document.locations.map(({ label: stored }) => stored)).toEqual([
      label,
    ]);
    expect(document.homeLocationId).toBe(document.locations[0]?.id);
  };

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(async () => {
    cleanup();
    await i18n.changeLanguage("ru");
  });

  f.Scenario(
    "Added in Russian, shown in English",
    ({ Given, And, When, Then }) => {
      Given("the interface language is {string}", world.givenLanguage);
      And("the zone cities data is loaded", world.givenData(DataMode.LOADED));
      And("the list is {string}", world.givenList);
      When("the user opens the app", world.openApp);
      Then("the row reads {string}", expectRowReads);
      When(
        'the user switches the interface language to "en"',
        switchLanguage("en"),
      );
      Then("the row now reads {string}", expectRowReads);
      When(
        'the user switches the interface language to "ru"',
        switchLanguage("ru"),
      );
      Then("the row reads {string} again", expectRowReads);
    },
  );

  f.Scenario(
    "Added in English, shown in Russian",
    ({ Given, And, When, Then }) => {
      Given("the interface language is {string}", world.givenLanguage);
      And("the zone cities data is loaded", world.givenData(DataMode.LOADED));
      And("the list is {string}", world.givenList);
      When("the user opens the app", world.openApp);
      Then("the row reads {string}", expectRowReads);
      When(
        'the user switches the interface language to "ru"',
        switchLanguage("ru"),
      );
      Then("the row now reads {string}", expectRowReads);
    },
  );

  f.Scenario("A switch keeps the stored list", ({ Given, And, When, Then }) => {
    Given("the interface language is {string}", world.givenLanguage);
    And("the zone cities data is loaded", world.givenData(DataMode.LOADED));
    And("the list is {string}", world.givenList);
    And("the home location is {string}", world.givenHome);
    When("the user opens the app", world.openApp);
    Then("the row reads {string}", expectRowReads);
    And("the row is the home location", () => {
      expect(world.getLocations().rows[0]?.mark?.accessibleLabel).toBe(
        i18n.t("locations.homeMarkLabel"),
      );
    });
    And(
      "the stored list holds {string} stored as home",
      (_ctx, label: string) => {
        storedDocumentBeforeSwitches = world.getBackend().document;
        expectStoredHome(_ctx, label);
      },
    );
    When(
      'the user switches the interface language to "ru"',
      switchLanguage("ru"),
    );
    And(
      'the user switches the interface language to "en"',
      switchLanguage("en"),
    );
    Then("the row reads {string} again", expectRowReads);
    And(
      "the stored list still holds {string} stored as home",
      expectStoredHome,
    );
    And("the stored location list was not written", () => {
      expect(world.getBackend().document).toBe(storedDocumentBeforeSwitches);
    });
  });

  f.Scenario(
    "Stored label until the data is loaded",
    ({ Given, And, When, Then }) => {
      Given("the interface language is {string}", world.givenLanguage);
      And(
        "the zone cities data has not been loaded",
        world.givenData(DataMode.HELD),
      );
      And("the list is {string}", world.givenList);
      When("the user opens the app", world.openApp);
      Then("the row reads {string}", expectRowReads);
      When(
        "the zone cities data finishes loading",
        world.whenDataFinishesLoading,
      );
      Then("the row now reads {string}", expectRowReads);
    },
  );

  f.Scenario("Loading fails", ({ Given, And, When, Then }) => {
    Given("the interface language is {string}", world.givenLanguage);
    And(
      "loading the zone cities data fails",
      world.givenData(DataMode.FAILING),
    );
    And("the list is {string}", world.givenList);
    When("the user opens the app", world.openApp);
    Then("the row reads {string}", expectRowReads);
    And("no error is shown", () => {
      expect(screen.queryByRole("alert")).toBeNull();
    });
  });

  f.Scenario("A label the data does not know", ({ Given, And, When, Then }) => {
    Given("the interface language is {string}", world.givenLanguage);
    And("the zone cities data is loaded", world.givenData(DataMode.LOADED));
    And("the list is {string}", world.givenList);
    When("the user opens the app", world.openApp);
    Then("the row reads {string}", expectRowReads);
  });

  f.Scenario(
    "A dialect reads its base language",
    ({ Given, And, When, Then }) => {
      Given('a dialect "ru-KZ" with base language "ru"', () =>
        expect(DIALECT_REGISTRY.map(({ metadata }) => metadata.code)).toContain(
          "ru-KZ",
        ),
      );
      And("the zone cities data is loaded", world.givenData(DataMode.LOADED));
      When(
        'the city label of {string} stored as {string} is read in "ru-KZ"',
        (_ctx, timeZoneId: string, storedLabel: string) => {
          dialectCityLabel = createCompositeCitySearch(zoneCities).getCityLabel(
            timeZoneId,
            storedLabel,
            resolveCityNameLanguage("ru-KZ", DIALECT_REGISTRY),
          );
        },
      );
      Then("the city label is {string}", (_ctx, label: string) =>
        expect(dialectCityLabel).toBe(label),
      );
    },
  );

  f.Scenario(
    "Removal is announced with the new city label",
    ({ Given, And, When, Then }) => {
      Given("the interface language is {string}", world.givenLanguage);
      And("the zone cities data is loaded", world.givenData(DataMode.LOADED));
      And("the list is {string}", world.givenList);
      When("the user opens the app", world.openApp);
      And('the user switches the interface language to "en"', async () => {
        await switchLanguage("en")();
        await waitFor(() =>
          expect(screen.getByText("Tokyo")).toBeInTheDocument(),
        );
      });
      And("the user removes {string}", async (_ctx, city: string) => {
        await userEvent.click(
          screen.getByRole("button", {
            name: i18n.t("locations.locationMenu", { city }),
          }),
        );
        await userEvent.click(
          screen.getByRole("menuitem", { name: i18n.t("locations.remove") }),
        );
      });
      Then("{string} is announced politely", (_ctx, text: string) => {
        const announcement = screen.getByText(text);
        expect(announcement).toHaveAttribute("aria-live", "polite");
      });
    },
  );
});
