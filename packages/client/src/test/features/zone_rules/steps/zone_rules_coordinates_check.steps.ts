// Implements FR2, FR3, FR4 of add-city-coordinates-to-locations (M2, M3).
import { readFileSync } from "node:fs";
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import {
  ZONE_COORDINATES_FILE,
  ZONE_RULES_RELEASE_FILE,
} from "../../../../../app.config";
import { loadZoneData } from "../../../../../scripts/zoneData/loadZoneData.ts";
import { checkZoneCoordinates } from "../../../../../scripts/zoneRules/checkZoneCoordinates.ts";

const feature = await loadFeature("../zone_rules_coordinates_check.feature");

const BUNDLED_RELEASE = (
  JSON.parse(readFileSync(ZONE_RULES_RELEASE_FILE, "utf8")) as {
    release: string;
  }
).release;
const COMMITTED_TEXT = readFileSync(ZONE_COORDINATES_FILE, "utf8");
const BROKEN_ZONE_ID = "Europe/Moscow";
const OTHER_RELEASE = "2026e";
const LATITUDE_BELOW_RANGE_TENTHS = -910;

function buildBrokenText(defect: string): string {
  const document = JSON.parse(COMMITTED_TEXT);
  if (defect.includes("name the release")) {
    document.release = OTHER_RELEASE;
  } else if (defect.includes("latitude -91")) {
    document.zones[BROKEN_ZONE_ID] = [LATITUDE_BELOW_RANGE_TENTHS, 0];
  } else {
    delete document.zones[BROKEN_ZONE_ID];
  }
  return JSON.stringify(document);
}

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const checkText = (text: string) =>
    checkZoneCoordinates(text, BUNDLED_RELEASE, loadZoneData().zoneCities);

  // @add-city-coordinates-to-locations @FR4 @M2
  f.Scenario("The committed zone coordinates pass", ({ When, Then }) => {
    let errors: string[] = [];
    When(
      "the zone coordinates check runs on the committed files without network access",
      () => {
        errors = checkText(COMMITTED_TEXT);
      },
    );
    Then("it passes", () => {
      expect(errors).toEqual([]);
    });
  });

  // @add-city-coordinates-to-locations @FR4 @M2
  f.ScenarioOutline(
    "A broken zone coordinates file fails",
    ({ Given, When, Then }, variables) => {
      let text = "";
      let errors: string[] = [];
      Given("committed zone coordinates with <defect>", () => {
        text = buildBrokenText(variables.defect);
      });
      When("the zone coordinates check runs", () => {
        errors = checkText(text);
      });
      Then("it fails with an error that names <named>", () => {
        expect(errors).toHaveLength(1);
        const [error] = errors as [string];
        if (variables.named === "both releases") {
          expect(error).toContain(OTHER_RELEASE);
          expect(error).toContain(BUNDLED_RELEASE);
        } else if (variables.named === "the zone and the latitude") {
          expect(error).toContain(BROKEN_ZONE_ID);
          expect(error).toContain("latitude");
        } else {
          expect(error).toContain(BROKEN_ZONE_ID);
        }
      });
    },
  );

  // @add-city-coordinates-to-locations @FR4
  f.Scenario("UTC needs no coordinates", ({ Given, When, Then }) => {
    let text = "";
    let errors: string[] = [];
    Given(
      "the zone coordinates hold no entry for {string}",
      (_ctx, zoneId: string) => {
        const document = JSON.parse(COMMITTED_TEXT);
        delete document.zones[zoneId];
        text = JSON.stringify(document);
      },
    );
    When("the zone coordinates check runs", () => {
      errors = checkText(text);
    });
    Then("it passes", () => {
      expect(errors).toEqual([]);
    });
  });
});
