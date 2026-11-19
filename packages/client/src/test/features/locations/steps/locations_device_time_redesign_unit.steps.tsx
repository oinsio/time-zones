// Verifies FR15, FR16, FR18 of redesign-cards-grid-and-day-palettes.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect } from "vitest";
import { createDeviceTimeChecks } from "./deviceTimeChecks";
import { createDeviceTimeWorld } from "./deviceTimeWorld";
import { rowHasHereMark } from "./deviceTimeZoneWorld";
import { readZoneLineElements } from "./zoneLineQueries";

const feature = await loadFeature(
  "../locations_device_time_redesign_unit.feature",
);

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDeviceTimeWorld();
  const checks = createDeviceTimeChecks(world);
  const { givenDeviceZone, givenInstant, givenList, givenLanguage, openApp } =
    world;

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(async () => {
    cleanup();
    await i18n.changeLanguage("ru");
  });

  // @redesign-cards-grid-and-day-palettes @FR15 @FR16
  f.Scenario("Reorder below a city", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the interface language is {string}", givenLanguage);
    And("the list is {string}", givenList);
    When("the user opens the app", openApp);
    And(
      "the user chooses {string} {int} times in the menu of the device time location",
      async (_ctx: unknown, itemName: string, times: number) => {
        for (let step = 0; step < times; step += 1) {
          await userEvent.click(
            within(world.deviceTimeRow()).getByRole("button", {
              expanded: false,
              name: /.+/,
            }),
          );
          await userEvent.click(
            screen.getByRole("menuitem", { name: itemName }),
          );
        }
      },
    );
    Then("the list is {string}", checks.expectListIs);
    And(
      "the announcement says the device time location {string} is at position {int} of {int}",
      (_ctx: unknown, city: string, position: number, total: number) =>
        expect(screen.getByText(/moved to position/u)).toHaveTextContent(
          i18n.t("locations.reorderMovedOver", { city, position, total }),
        ),
    );
  });

  // @redesign-cards-grid-and-day-palettes @FR18
  f.Scenario(
    "Device time zone line and Here mark without a caption",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the interface language is {string}", givenLanguage);
      And("the current instant is {string}", givenInstant);
      And("the list is {string}", givenList);
      When("the user opens the app", openApp);
      Then(
        "the device time zone line elements are {string}, {string} and {string}",
        (_ctx: unknown, ...elements: string[]) =>
          expect(readZoneLineElements(world.deviceTimeRow())).toEqual(elements),
      );
      And(
        "the device time location shows the Here mark without a visible caption",
        () => {
          const hereLabel = i18n.t("locations.hereMarkLabel");
          expect(rowHasHereMark(world.deviceTimeRow(), hereLabel)).toBe(true);
          expect(world.deviceTimeRow()).not.toHaveTextContent(hereLabel);
        },
      );
    },
  );
});
