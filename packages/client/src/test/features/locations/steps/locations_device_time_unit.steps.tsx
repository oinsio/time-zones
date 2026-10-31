// Verifies FR1, FR3, FR8, FR9, FR11, FR16 of add-settings-page-and-device-time-location.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, cleanup, screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect } from "vitest";
import { LocationErrorCode } from "@/model";
import { createDeviceTimeChecks } from "./deviceTimeChecks";
import { createDeviceTimeWorld, DataMode } from "./deviceTimeWorld";

const DIFFERENCE_ENTRY_PATTERN = /^(.+?) ([+−].+)$/u;
const LANGUAGES_TO_SWITCH = ["en", "ru"];

const feature = await loadFeature("../locations_device_time_unit.feature");

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDeviceTimeWorld();
  const checks = createDeviceTimeChecks(world);
  const {
    givenDeviceZone,
    givenInstant,
    givenList,
    givenLanguage,
    openApp,
    whenAdds,
    whenRemoves,
    whenAddsDeviceTime,
  } = world;
  const loadedData = world.givenData(DataMode.LOADED);
  let addResult: { ok: boolean; error?: string } | undefined;
  let listBeforeAdding = "";

  const menuItemNamesOf = async (row: HTMLElement) => {
    await userEvent.click(
      within(row).getByRole("button", { expanded: false, name: /.+/ }),
    );
    return screen.getAllByRole("menuitem").map((item) => item.textContent);
  };

  f.BeforeEachScenario(world.reset);
  f.AfterAllScenarios(async () => {
    cleanup();
    await i18n.changeLanguage("ru");
  });

  // @add-settings-page-and-device-time-location @FR8 @UX3
  f.Scenario(
    "Device time location on the design sample",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the interface language is {string}", givenLanguage);
      And("the zone cities data is loaded", loadedData);
      And("the current instant is {string}", givenInstant);
      And("the list is {string}", givenList);
      When("the user opens the app", openApp);
      Then(
        "the device time location shows {string}, the caption {string}, the meta line {string}, the time {string} and the date {string}",
        async (_ctx: unknown, ...texts: string[]) => {
          for (const text of texts) await checks.expectDeviceTimeShows(text);
        },
      );
      And(
        "the device time location shows no offset difference",
        checks.expectNoOffsetDifference,
      );
      And(
        "the rows show the offset differences {string}",
        (_ctx: unknown, differences: string) => {
          for (const entry of differences.split(", ")) {
            const [, city, label] = entry.match(DIFFERENCE_ENTRY_PATTERN) ?? [];
            checks.expectCardDifference(_ctx, city, label);
          }
        },
      );
    },
  );

  // @add-settings-page-and-device-time-location @FR1 @FR8
  f.Scenario(
    "The device's city next to the device time location",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the list is {string}", givenList);
      When("the user opens the app", openApp);
      And("the user adds {string}", whenAdds);
      Then("the list is {string}", checks.expectListIs);
    },
  );

  // @add-settings-page-and-device-time-location @FR8
  f.Scenario(
    "The device moves to another zone",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the interface language is {string}", givenLanguage);
      And("the list is {string}", givenList);
      When("the user opens the app", openApp);
      And(
        "the device time zone becomes {string} and the minute tick reads it",
        world.whenDeviceZoneBecomesAndTicks,
      );
      Then(
        "the device time location shows {string} and the meta line {string}",
        async (_ctx: unknown, ...texts: string[]) => {
          for (const text of texts) await checks.expectDeviceTimeShows(text);
        },
      );
      And("the list is still {string}", checks.expectListIs);
    },
  );

  // @add-settings-page-and-device-time-location @FR8
  f.Scenario("Unknown device time zone", ({ Given, And, When, Then }) => {
    Given("the device reports the time zone {string}", givenDeviceZone);
    And("the interface language is {string}", givenLanguage);
    And("the list is {string}", givenList);
    When("the user opens the app", openApp);
    Then(
      "the device time location shows {string}, the caption {string} and the meta line {string}",
      async (_ctx: unknown, ...texts: string[]) => {
        for (const text of texts) await checks.expectDeviceTimeShows(text);
      },
    );
  });

  // @add-settings-page-and-device-time-location @FR9 @UX3
  f.Scenario("Same menu as a city card", ({ Given, And, When, Then }) => {
    Given("the interface language is {string}", givenLanguage);
    And("the list is {string}", givenList);
    When("the user opens the app", openApp);
    Then(
      "the menu of the device time location offers {string} and {string}, as the menu of {string} does",
      async (_ctx: unknown, makeHome: string, remove: string, city: string) => {
        const deviceTimeItems = await menuItemNamesOf(world.deviceTimeRow());
        await userEvent.keyboard("{Escape}");
        const cityItems = await menuItemNamesOf(world.cardOf(city));
        expect(deviceTimeItems).toEqual([makeHome, remove]);
        expect(cityItems).toEqual(deviceTimeItems);
      },
    );
  });

  // @add-settings-page-and-device-time-location @FR9
  f.Scenario(
    "Remove the device time location",
    ({ Given, When, And, Then }) => {
      Given("the list is {string}", givenList);
      When("the user opens the app", openApp);
      And("the user removes {string}", whenRemoves);
      Then("the list is {string}", checks.expectListIs);
    },
  );

  // @add-settings-page-and-device-time-location @FR11
  f.Scenario("Add it back", ({ Given, When, And, Then }) => {
    Given("the list is {string}", givenList);
    When("the user opens the app", openApp);
    And("the user adds the device time location", whenAddsDeviceTime);
    Then("the list is {string}", checks.expectListIs);
  });

  // @add-settings-page-and-device-time-location @FR11
  f.Scenario("Already listed", ({ Given, When, And, Then }) => {
    Given("the list is {string}", givenList);
    When("the user opens the app", openApp);
    And("the user adds the device time location", () => {
      listBeforeAdding = screen.getByRole("list").textContent ?? "";
      act(() => {
        addResult = world.getLocations().addDeviceTimeLocation();
      });
    });
    Then("the addition is rejected as a duplicate location", () =>
      expect(addResult).toMatchObject({
        ok: false,
        error: LocationErrorCode.DUPLICATE_LOCATION,
      }),
    );
    And("the list is {string}", (_ctx: unknown, list: string) => {
      checks.expectListIs(_ctx, list);
      expect(screen.getByRole("list").textContent).toBe(listBeforeAdding);
    });
  });

  // @add-settings-page-and-device-time-location @FR8
  // @keep-now-button-visible-when-live @FR3
  f.Scenario(
    "Time selection from the device time location",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenDeviceZone);
      And("the current instant is {string}", givenInstant);
      And("the list is {string}", givenList);
      When("the user opens the app", openApp);
      And(
        "the user moves the device time location's day track one hour forward",
        world.whenMovesDeviceTimeTrackOneHourForward,
      );
      Then(
        "the device time location shows the time {string}",
        (_ctx: unknown, time: string) => checks.expectDeviceTimeShows(time),
      );
      And("the {string} row shows the time {string}", checks.expectCardTime);
      And("the Now button is active", () =>
        expect(world.nowButton()).toBeEnabled(),
      );
    },
  );

  // @add-settings-page-and-device-time-location @FR16
  f.Scenario("Both languages", ({ Given, And, When, Then }) => {
    const metaLines: string[] = [];
    Given("the device time zone is {string}", givenDeviceZone);
    And("the list is {string}", givenList);
    When("the user opens the app", openApp);
    And(
      "the interface language is switched between English and Russian",
      async () => {
        for (const language of LANGUAGES_TO_SWITCH) {
          await act(async () => {
            await i18n.changeLanguage(language);
          });
          metaLines.push(
            within(world.deviceTimeRow()).getByText(/UTC/).textContent ?? "",
          );
        }
      },
    );
    Then(
      "the meta line reads {string} and {string}",
      (_ctx: unknown, english: string, russian: string) => {
        expect(metaLines).toEqual([english, russian]);
      },
    );
  });
});
