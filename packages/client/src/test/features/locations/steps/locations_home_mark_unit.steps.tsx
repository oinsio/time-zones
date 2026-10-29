// Verifies FR7 of set-home-location-and-show-differences.
// Verifies FR1, FR2, FR4 of match-home-mark-to-design.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { cleanup, within } from "@testing-library/react/pure";
import { expect } from "vitest";
import en from "@/locales/en.json";
import { LocationMarkKind } from "@/presenter";
import {
  createDeviceTimeZoneWorld,
  ENGLISH_LANGUAGE,
  hereCaption,
  rowHasHereMark,
} from "./deviceTimeZoneWorld";

const feature = await loadFeature("../locations_home_mark_unit.feature");

const HERE_MARK_LABEL = en.locations.hereMarkLabel;
const HOME_MARK_LABEL = en.locations.homeMarkLabel;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDeviceTimeZoneWorld();
  const { openApp, givenDeviceZone, givenList, givenHome, rowOf } = world;

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(() => cleanup());

  // @set-home-location-and-show-differences @FR7
  f.Scenario(
    "The home row shows no here mark",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the list contains {string}", givenList);
      And("{string} is home", givenHome);
      When("the user opens the app", openApp);
      Then(
        "the {string} row shows no here mark and no caption {string}",
        (_ctx, city: string) => {
          const row = rowOf(city);
          expect(rowHasHereMark(row, hereCaption(ENGLISH_LANGUAGE))).toBe(
            false,
          );
          expect(
            within(row).queryByRole("img", { name: HERE_MARK_LABEL }),
          ).toBeNull();
        },
      );
    },
  );

  // @set-home-location-and-show-differences @FR7
  f.Scenario("Home wins over here", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list contains {string}", givenList);
    And("{string} is home", givenHome);
    When("the user opens the app", openApp);
    Then(
      "the {string} row has exactly {int} leading mark, of the kind {string}",
      (_ctx, city: string, count: number, kind: string) => {
        expect(kind).toBe(LocationMarkKind.HOME);
        const marks = within(rowOf(city)).getAllByRole("img");
        expect(marks).toHaveLength(count);
        expect(marks[0]).toHaveAccessibleName(HOME_MARK_LABEL);
      },
    );
  });

  // @match-home-mark-to-design @FR1 @FR2 @FR4 @M3
  f.Scenario(
    "The home mark is the design's outlined house",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the list contains {string}", givenList);
      And("{string} is home", givenHome);
      When("the user opens the app", openApp);
      Then(
        "the house of {string} draws exactly {int} closed outline and paints nothing inside",
        (_ctx, city: string, outlineCount: number) => {
          const house = within(rowOf(city)).getByRole("img", {
            name: HOME_MARK_LABEL,
          });
          const icon = house.querySelector("svg");
          const paths = icon?.querySelectorAll("path") ?? [];
          expect(icon).toHaveAttribute("fill", "none");
          expect(paths).toHaveLength(outlineCount);
          expect(paths[0].getAttribute("d")).toMatch(/z$/i);
          expect(
            icon?.querySelectorAll(
              "circle, rect, line, polyline, polygon, ellipse",
            ),
          ).toHaveLength(0);
        },
      );
      And("the arrow of {string} is filled", (_ctx, city: string) => {
        const arrow = within(rowOf(city)).getByRole("img", {
          name: HERE_MARK_LABEL,
        });
        expect(arrow.querySelector("svg")).toHaveAttribute(
          "fill",
          "currentColor",
        );
      });
    },
  );
});
