// Verifies FR1, FR2, FR3, FR4, UX1, UX2, UX3, M2, M3 of match-here-mark-to-design.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, render, screen } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import {
  LOCATION_MARK_TEXT_KEYS,
  LocationMarkKind,
  presentLocationMarks,
} from "@/presenter";
import { LocationMarkIcon } from "@/views/shared";
import {
  createDeviceTimeZoneWorld,
  ENGLISH_LANGUAGE,
  hereCaption,
  rowHasHereMark,
} from "./deviceTimeZoneWorld";

const feature = await loadFeature("../locations_here_mark_unit.feature");

const FORMER_PILL_TEXT = /Your time zone/;
const MARK_ID = "mark";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDeviceTimeZoneWorld();
  const { openApp, givenDeviceZone, givenList, givenLanguage, rowOf } = world;

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(() => cleanup());

  const cityLineIn = (row: HTMLElement) => {
    const citySpan = row.querySelector(`[id][class*="font-semibold"]`);
    return {
      citySpan: citySpan as HTMLElement,
      line: citySpan?.parentElement as HTMLElement,
    };
  };
  const cityLineOf = (city: string) => cityLineIn(rowOf(city));
  const countIconsBeforeCity = (row: HTMLElement) => {
    const { citySpan, line } = cityLineIn(row);
    const cityIndex = Array.from(line.children).indexOf(citySpan);
    return Array.from(line.children)
      .slice(0, cityIndex)
      .filter((child) => child.querySelector("svg") !== null).length;
  };
  const listRows = () => screen.getAllByRole("listitem");
  const expectIconCountBeforeCity = (
    _ctx: unknown,
    city: string,
    expectedCount: number,
  ) => expect(countIconsBeforeCity(rowOf(city))).toBe(expectedCount);

  // @match-here-mark-to-design @FR1 @UX1 @UX2 @UX3
  f.Scenario(
    "Icon before the city, caption after it",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the list contains {string}", givenList);
      When("the user opens the app", openApp);
      Then(
        "on the city line of {string} the mark image precedes the city and the caption follows it",
        (_ctx, city: string) => {
          const { citySpan, line } = cityLineOf(city);
          const children = Array.from(line.children);
          expect(children).toHaveLength(3);
          expect(children[0]?.querySelector("svg")).not.toBeNull();
          expect(children[1]).toBe(citySpan);
          expect(children[2]).toHaveTextContent(hereCaption(ENGLISH_LANGUAGE));
        },
      );
      And(
        "the city line of {string} starts with the city",
        (_ctx, city: string) => {
          const { citySpan, line } = cityLineOf(city);
          expect(line.firstElementChild).toBe(citySpan);
        },
      );
    },
  );

  // @match-here-mark-to-design @FR2 @M2
  f.Scenario("The former pill is gone", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    When("the user opens the app", openApp);
    Then("exactly {int} rows show the here mark", (_ctx, count: number) => {
      const markedRows = listRows().filter((row) =>
        rowHasHereMark(row, hereCaption(ENGLISH_LANGUAGE)),
      );
      expect(markedRows).toHaveLength(count);
    });
    And("exactly {int} rows have an icon before their city", (_ctx, count) => {
      const iconRows = listRows().filter(
        (row) => countIconsBeforeCity(row) > 0,
      );
      expect(iconRows).toHaveLength(count);
    });
    And("no text says {string}", () => {
      expect(screen.queryByText(FORMER_PILL_TEXT)).toBeNull();
    });
  });

  // @match-here-mark-to-design @FR4
  f.Scenario(
    "A marked row has exactly one leading mark",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the list contains {string}", givenList);
      When("the user opens the app", openApp);
      Then(
        "the {string} row has {int} icon before its city",
        expectIconCountBeforeCity,
      );
      And(
        "the {string} row has {int} icons before its city",
        expectIconCountBeforeCity,
      );
    },
  );

  // @match-here-mark-to-design @FR4 @FR3 @M3
  f.ScenarioOutline(
    "Every mark kind is fully defined",
    ({ Given, Then, And }, variables) => {
      Given("the interface language is {string}", givenLanguage);
      Then(
        "every mark kind has an accessible label and, where it has one, a caption",
        () => {
          const marks = presentLocationMarks(
            i18n.getFixedT(variables.language),
          );
          for (const kind of Object.values(LocationMarkKind)) {
            expect(marks[kind].accessibleLabel).not.toBe("");
            if (LOCATION_MARK_TEXT_KEYS[kind].captionKey !== undefined) {
              expect(marks[kind].caption).not.toBe("");
            }
          }
        },
      );
      And("every mark kind renders an icon", () => {
        const marks = presentLocationMarks(i18n.getFixedT(variables.language));
        for (const kind of Object.values(LocationMarkKind)) {
          cleanup();
          const { container } = render(
            <LocationMarkIcon mark={marks[kind]} id={MARK_ID} />,
          );
          expect(container.querySelector("svg")).not.toBeNull();
        }
      });
    },
  );
});
