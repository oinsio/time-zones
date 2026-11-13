// Verifies FR2, FR5, FR6, FR13, UX1, UX2, M4 of show-zone-abbreviations-and-zone-label-setting.
// Verifies FR3, FR4, UX2, M1 of add-country-to-zone-label.
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

const feature = await loadFeature("../locations_zone_line_unit.feature");
const ELEMENT_SEPARATOR = ", ";
const ABBREVIATION_TOGGLE = "Abbreviation";
const NO_ELEMENT_TEXT = "no element";

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
  const givenDeviceZone = (_ctx: unknown, zone: string) =>
    world.setDeviceZone(zone);
  const openApp = () => world.open();
  const thenElements = (_ctx: unknown, city: string, elements: string) =>
    expect(world.zoneLineOf(city)).toEqual(
      elements === NO_ELEMENT_TEXT ? [] : elements.split(ELEMENT_SEPARATOR),
    );
  const thenShows = (
    _ctx: unknown,
    first: string,
    firstText: string,
    second: string,
    secondText: string,
  ) => {
    expect(world.zoneLineOf(first)).toContain(firstText);
    expect(world.zoneLineOf(second)).toContain(secondText);
  };

  // @show-zone-abbreviations-and-zone-label-setting @FR5 @add-country-to-zone-label @FR3
  f.Scenario(
    "Country, abbreviation and offset",
    ({ Given, And, When, Then }) => {
      Given("the interface language is {string}", givenLanguage);
      And("the zone label shows {string}", givenZoneLabel);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", openApp);
      Then(
        "the {string} zone line elements are {string}, {string}, {string}",
        (_ctx, city: string, ...elements: string[]) =>
          expect(world.zoneLineOf(city)).toEqual(elements),
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR5 @FR13 @M4
  f.ScenarioOutline(
    "The zone label decides the elements",
    ({ Given, And, When, Then }, variables) => {
      Given("the interface language is {string}", givenLanguage);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      And('the zone label shows "<parts>"', () =>
        givenZoneLabel(undefined, variables.parts),
      );
      When("the user opens the app", openApp);
      Then(
        'the {string} zone line elements are "<elements>"',
        (_ctx, city: string) =>
          thenElements(undefined, city, variables.elements),
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR2 @FR5
  f.Scenario(
    "The abbreviation follows the reference moment",
    ({ Given, And, When, Then }) => {
      Given(
        "the list contains {string} and {string}",
        (_ctx: unknown, ...cities: string[]) =>
          world.setList(cities.join(ELEMENT_SEPARATOR)),
      );
      And("the current instant is {string}", givenInstant);
      When("the user opens the app", openApp);
      Then('"New York" shows "EST" and "Dublin" shows "GMT"', () =>
        thenShows(undefined, "New York", "EST", "Dublin", "GMT"),
      );
      When("the user pins the moment to {string}", (_ctx, instant: string) =>
        world.pinMoment(instant.slice(0, "2026-07-15".length)),
      );
      Then('"New York" shows "EDT" and "Dublin" shows "IST"', () =>
        thenShows(undefined, "New York", "EDT", "Dublin", "IST"),
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR5 @UX1
  f.Scenario(
    "Unknown elements leave nothing behind",
    ({ Given, And, When, Then }) => {
      Given("the current instant is {string}", givenInstant);
      And(
        "the list contains {string} and {string}",
        (_ctx: unknown, ...cities: string[]) =>
          world.setList(cities.join(ELEMENT_SEPARATOR)),
      );
      When("the user opens the app", openApp);
      Then(
        'the "Almaty" zone line elements are {string}',
        (_ctx, elements: string) => thenElements(undefined, "Almaty", elements),
      );
      And(
        'the "UTC" zone line elements are {string}',
        (_ctx, elements: string) => thenElements(undefined, "UTC", elements),
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR5
  f.Scenario(
    "UTC with the zone abbreviation only",
    ({ Given, And, When, Then }) => {
      Given("the interface language is {string}", givenLanguage);
      And("the zone label shows {string}", givenZoneLabel);
      And("the current instant is {string}", givenInstant);
      And("the list contains {string}", givenList);
      When("the user opens the app", openApp);
      Then("the {string} zone line elements are {string}", thenElements);
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR13 @UX2
  f.Scenario(
    "A change applies to every row at once",
    ({ Given, When, And, Then }) => {
      Given("the list is {string}", givenList);
      When("the user opens the app", openApp);
      And(
        "the user turns the zone abbreviation off in the settings and goes back",
        async () => {
          rowTextsBefore = rowTextsWithoutZoneLine();
          await world.toggleInSettings(ABBREVIATION_TOGGLE);
        },
      );
      Then("no row shows a zone abbreviation", () => {
        for (const row of screen.getAllByRole("listitem")) {
          expect(readZoneLineElements(row)).not.toContain("MSK");
          expect(readZoneLineElements(row)).not.toContain("IST");
        }
      });
      And(
        "the city labels, local times and offset differences are unchanged",
        () => expect(rowTextsWithoutZoneLine()).toEqual(rowTextsBefore),
      );
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR5
  f.Scenario(
    "Offset hidden by the zone label",
    ({ Given, And, When, Then }) => {
      Given("the current instant is {string}", givenInstant);
      And("the zone label shows {string}", givenZoneLabel);
      And("the list contains {string}", givenList);
      When("the user opens the app", openApp);
      Then("the {string} zone line elements are {string}", thenElements);
    },
  );

  // @show-zone-abbreviations-and-zone-label-setting @FR6
  f.ScenarioOutline(
    "Meta line follows the zone label",
    ({ Given, And, When, Then }, variables) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the interface language is {string}", givenLanguage);
      And("the list is {string}", givenList);
      And('the zone label shows "<parts>"', () =>
        givenZoneLabel(undefined, variables.parts),
      );
      When("the user opens the app", openApp);
      Then('the meta line is "<meta line>"', () =>
        expect(readZoneLineElements(world.deviceTimeRowOf())).toEqual(
          variables["meta line"].split(ELEMENT_SEPARATOR),
        ),
      );
    },
  );
});
