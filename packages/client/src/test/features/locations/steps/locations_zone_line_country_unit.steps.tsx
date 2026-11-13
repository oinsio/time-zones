// Verifies FR3, FR4, UX2 of add-country-to-zone-label.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen } from "@testing-library/react/pure";
import { expect, vi } from "vitest";
import { readZoneLineElements } from "./zoneLineQueries";
import {
  createZoneLineWorld,
  type ZONE_LABEL_PART_NAMES,
} from "./zoneLineWorld";

vi.mock(
  "virtual:pwa-register/react",
  async () =>
    (await import("@/test/fakeServiceWorker")).fakeServiceWorkerModule,
);

const feature = await loadFeature(
  "../locations_zone_line_country_unit.feature",
);
const COUNTRY_TOGGLE = "Country";
const COUNTRY_NAMES = ["Russia", "India"];
const DEVICE_TIME_TEXT = "Device time";

type PartsName = keyof typeof ZONE_LABEL_PART_NAMES;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createZoneLineWorld();
  let rowTextsBefore: string[] = [];

  /** Everything of the rows but their zone line elements. */
  const rowTextsWithoutZoneLine = () =>
    screen.getAllByRole("listitem").map((row) => {
      const copy = row.cloneNode(true) as HTMLElement;
      copy.querySelector("[data-zone-line]")?.remove();
      return copy.textContent;
    });

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(world.finish);

  const givenLanguage = (_ctx: unknown, language: string) =>
    world.setLanguage(language);
  const givenInstant = (_ctx: unknown, instant: string) =>
    world.setInstant(instant);
  const givenZoneLabel = (_ctx: unknown, parts: string) =>
    world.setZoneLabel(parts as PartsName);
  const givenList = (_ctx: unknown, list: string) => world.setList(list);
  const openApp = () => world.open();

  // @add-country-to-zone-label @FR3 @UX2
  f.Scenario(
    "No zone line when every part is hidden",
    ({ Given, And, When, Then }) => {
      Given("the interface language is {string}", givenLanguage);
      And("the zone label shows {string}", givenZoneLabel);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", openApp);
      Then("the {string} row has no zone line", (_ctx, city: string) =>
        expect(world.rowOf(city).querySelector("[data-zone-line]")).toBeNull(),
      );
      And(
        "the {string} row shows its city, its local time and its offset difference",
        (_ctx, city: string) => {
          const rowText = world.rowOf(city).textContent ?? "";
          expect(rowText).toContain(city);
          expect(rowText).toMatch(/\d:\d\d/);
        },
      );
    },
  );

  // @add-country-to-zone-label @FR3 @FR4
  f.Scenario(
    "Hiding the country applies to every row at once",
    ({ Given, And, When, Then }) => {
      Given("the interface language is {string}", givenLanguage);
      And("the list is {string}", givenList);
      When("the user opens the app", openApp);
      And(
        "the user turns the country off in the settings and goes back",
        async () => {
          rowTextsBefore = rowTextsWithoutZoneLine();
          await world.toggleInSettings(COUNTRY_TOGGLE);
        },
      );
      Then("no row shows a country name", () => {
        for (const row of screen.getAllByRole("listitem")) {
          for (const countryName of COUNTRY_NAMES) {
            expect(readZoneLineElements(row)).not.toContain(countryName);
          }
        }
      });
      And(
        "the device time location still shows {string}",
        (_ctx, text: string) => {
          expect(text).toBe(DEVICE_TIME_TEXT);
          expect(readZoneLineElements(world.deviceTimeRowOf())[0]).toBe(text);
        },
      );
      And(
        "the city labels, local times and offset differences are unchanged",
        () => expect(rowTextsWithoutZoneLine()).toEqual(rowTextsBefore),
      );
    },
  );
});
