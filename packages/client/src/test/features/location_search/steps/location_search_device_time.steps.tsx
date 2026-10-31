// Verifies FR11 of add-settings-page-and-device-time-location.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect } from "vitest";
import {
  createDeviceTimeWorld,
  DataMode,
} from "../../locations/steps/deviceTimeWorld";

const feature = await loadFeature("../location_search_device_time.feature");
const DEVICE_TIME_OPTION_NAME = "Device time";
const DATA_MODE_BY_STATE: Record<string, DataMode> = {
  loading: DataMode.HELD,
  "failed to load": DataMode.FAILING,
};

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDeviceTimeWorld();

  const openSearch = async () => {
    await world.openApp();
    await userEvent.click(
      screen.getByRole("button", { name: i18n.t("locations.addLocation") }),
    );
    await screen.findByRole("combobox");
  };
  const search = async (query: string) => {
    await openSearch();
    await userEvent.type(screen.getByRole("combobox"), query);
  };
  const optionNames = () =>
    screen.queryAllByRole("option").map((option) => option.textContent);
  const expectDeviceTimeFirst = () =>
    expect(optionNames()[0]).toContain(DEVICE_TIME_OPTION_NAME);
  const expectDeviceTimeAbsent = () =>
    expect(optionNames().join()).not.toContain(DEVICE_TIME_OPTION_NAME);

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(async () => {
    cleanup();
    await i18n.changeLanguage("ru");
  });

  // @add-settings-page-and-device-time-location @FR11
  f.Scenario("Offered after removal", ({ Given, When, Then, And }) => {
    Given("the list is {string}", world.givenList);
    When("the user opens the search", openSearch);
    Then("the first option is {string}", expectDeviceTimeFirst);
    And("the popular suggestions follow it", () => {
      expect(
        screen.getByText(i18n.t("locations.suggestionsHeading")),
      ).toBeVisible();
      expect(optionNames().length).toBeGreaterThan(1);
    });
  });

  // @add-settings-page-and-device-time-location @FR11
  f.ScenarioOutline(
    "Matched by a word in either language",
    ({ Given, And, When, Then }, variables) => {
      Given("the list is {string}", world.givenList);
      And("the interface language is {string}", world.givenLanguage);
      When("the user searches for {string}", () => search(variables.query));
      Then("the {string} option is shown first", expectDeviceTimeFirst);
    },
  );

  // @add-settings-page-and-device-time-location @FR11
  f.Scenario("Not matched", ({ Given, When, Then }) => {
    Given("the list is {string}", world.givenList);
    When("the user searches for {string}", (_ctx, query: string) =>
      search(query),
    );
    Then("no {string} option is shown", expectDeviceTimeAbsent);
  });

  // @add-settings-page-and-device-time-location @FR11
  f.ScenarioOutline(
    "Shown while the search data loads or failed",
    ({ Given, And, When, Then }, variables) => {
      Given("the list is {string}", world.givenList);
      And("the search data is <state>", () =>
        world.givenData(DATA_MODE_BY_STATE[variables.state])(),
      );
      When("the user opens the search", openSearch);
      Then("the {string} option is shown", expectDeviceTimeFirst);
    },
  );

  // @add-settings-page-and-device-time-location @FR11
  f.Scenario("Hidden while listed", ({ Given, When, Then }) => {
    Given("the list is {string}", world.givenList);
    When("the user opens the search", openSearch);
    Then("no {string} option is shown", expectDeviceTimeAbsent);
  });
});
