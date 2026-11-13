// Verifies FR15 of show-zone-abbreviations-and-zone-label-setting.
// Verifies FR6 of add-country-to-zone-label.

import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { createZoneLabelWorld } from "./zoneLabelWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature("../settings_zone_label_sync_unit.feature");
const UTC_OFFSET_TOGGLE = "UTC offset";
const COUNTRY_TOGGLE = "Country";
const COUNTRY_NAMES = ["Russia", "Россия"];
const COUNTRY_NAME_PATTERN = new RegExp(COUNTRY_NAMES.join("|"));

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createZoneLabelWorld();

  f.BeforeEachScenario(async () => {
    await world.reset();
  });
  f.AfterAllScenarios(world.finish);

  const givenList = (_ctx: unknown, city: string) => world.setList(city);

  // @add-country-to-zone-label @FR6
  f.Scenario(
    "Another tab changes the country",
    ({ Given, And, When, Then }) => {
      Given("the list contains {string}", givenList);
      And("the app is open in two tabs", () => {
        world.givenTwoTabs();
        world.openTab();
        world.openTab();
      });
      When("the user turns the country off in the first tab", async () => {
        await world.toggle(COUNTRY_TOGGLE, world.openedTabs()[0]);
        world.runPendingWrite(world.openedTabs()[0]);
      });
      Then(
        "the second tab shows no country name on its Moscow row without a reload",
        () =>
          expect(
            world.rowZoneLine("Moscow", world.openedTabs()[1]),
          ).not.toContainEqual(expect.stringMatching(COUNTRY_NAME_PATTERN)),
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR15
  f.Scenario(
    "Another tab changes the zone label",
    ({ Given, And, When, Then }) => {
      Given("the list contains {string}", givenList);
      And("the app is open in two tabs", () => {
        world.givenTwoTabs();
        world.openTab();
        world.openTab();
      });
      When("the user turns the UTC offset off in the first tab", async () => {
        await world.toggle(UTC_OFFSET_TOGGLE, world.openedTabs()[0]);
        world.runPendingWrite(world.openedTabs()[0]);
      });
      Then(
        "the second tab shows no UTC offset on its location rows without a reload",
        () =>
          expect(
            world
              .allRowsZoneLines(world.openedTabs()[1])
              .flat()
              .filter((element) => element.startsWith("UTC")),
          ).toEqual([]),
      );
    },
  );
});
