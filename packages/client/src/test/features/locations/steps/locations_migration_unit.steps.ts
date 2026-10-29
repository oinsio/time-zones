// Verifies FR8 of set-home-location-and-show-differences.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
// "pure" skips auto-cleanup: each step is its own test, the app must survive between steps.
import { cleanup } from "@testing-library/react/pure";
import { expect, vi } from "vitest";
import { LocationMarkKind } from "@/model";
import {
  cityEntry,
  labelsOf,
  type OpenedApp,
  openApp,
  storeDocument,
} from "./locationsPersistenceWorld";

const feature = await loadFeature("../locations_migration_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  let app: OpenedApp;

  f.BeforeEachScenario(() => {
    cleanup();
    localStorage.clear();
  });
  f.AfterAllScenarios(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // @set-home-location-and-show-differences @FR8
  f.Scenario(
    "Previous document version is migrated",
    ({ Given, When, Then, And }) => {
      Given(
        "the stored list is a version 1 document with Almaty, Moscow and Kolkata",
        () => {
          storeDocument(["Almaty", "Moscow", "Kolkata"].map(cityEntry));
          vi.spyOn(localStorage, "setItem");
        },
      );
      When("the app is opened", () => {
        app = openApp();
      });
      Then("the list is Almaty, Moscow, Kolkata in that order", () => {
        expect(labelsOf(app)).toEqual(["Almaty", "Moscow", "Kolkata"]);
      });
      And("no location is home", () => {
        expect(
          app.result.current.rows.map(({ mark }) => mark?.kind),
        ).not.toContain(LocationMarkKind.HOME);
      });
      And("the stored list was not written", () => {
        expect(localStorage.setItem).not.toHaveBeenCalled();
      });
    },
  );
});
