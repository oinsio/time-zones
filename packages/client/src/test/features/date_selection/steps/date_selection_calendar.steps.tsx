import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { expect } from "vitest";
import { createDateSelectionWorld } from "./dateSelectionWorld";

const feature = await loadFeature("../date_selection_calendar.feature");

const NEXT_MONTH_COUNT = 4;

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDateSelectionWorld();

  f.BeforeEachScenario(async () => {
    await world.reset();
  });
  f.AfterAllScenarios(world.finish);

  const calendarDialog = () => screen.queryByRole("dialog");
  const clickByName = (name: string) =>
    userEvent.click(screen.getByRole("button", { name }));
  const openCalendar = () =>
    userEvent.click(screen.getByRole("button", { name: /^Choose date/ }));
  const pickDay = (dayNumber: string) => {
    const dayButton = within(screen.getByRole("dialog"))
      .getAllByRole("button")
      .find((button) => button.textContent === dayNumber);
    return userEvent.click(dayButton as HTMLElement);
  };

  const givenZone = (_ctx: unknown, zone: string) => world.setDeviceZone(zone);
  const givenInstant = (_ctx: unknown, timestamp: string) =>
    world.setInstant(timestamp);
  const givenList = (_ctx: unknown, cities: string) =>
    world.setStoredCities(cities);
  const givenAppOpen = () => world.openApp();
  const thenCalendarClosed = () => expect(calendarDialog()).toBeNull();
  const thenMomentLive = () => world.expectLive();

  // @select-date-with-calendar-and-now @FR3
  f.Scenario("Pick a date in a later month", ({ Given, And, When, Then }) => {
    Given("the device time zone is {string}", givenZone);
    And("the current instant is {string}", givenInstant);
    And("the list contains {string}", givenList);
    And("the app is open", givenAppOpen);
    When("the user opens the calendar", openCalendar);
    Then("it shows {string}", (_ctx, heading: string) =>
      expect(
        within(screen.getByRole("dialog")).getByRole("heading", {
          name: heading,
        }),
      ).toBeInTheDocument(),
    );
    When(
      "the user shows the next month 4 times and picks the 15th",
      async () => {
        for (let month = 0; month < NEXT_MONTH_COUNT; month++) {
          await clickByName(i18n.t("date.nextMonth"));
        }
        await pickDay("15");
      },
    );
    Then("the calendar is closed", thenCalendarClosed);
    And("the shown date is {string}", (_ctx, isoDate: string) =>
      expect(world.shownIsoDate()).toBe(isoDate),
    );
    And(
      "the {string} row shows the time {string} and the date {string}",
      (_ctx, city: string, time: string, date: string) =>
        world.expectRowShows(city, time, date),
    );
  });

  // @select-date-with-calendar-and-now @FR3
  f.Scenario(
    "Picking the shown date changes nothing",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the app is open", givenAppOpen);
      When("the user opens the calendar and picks the 8th", async () => {
        await openCalendar();
        await pickDay("8");
      });
      Then("the calendar is closed", thenCalendarClosed);
      And("the moment is live", thenMomentLive);
    },
  );

  // @select-date-with-calendar-and-now @FR3
  // @keep-now-button-visible-when-live @FR3
  f.Scenario(
    "Closing the calendar changes nothing",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And("the app is open", givenAppOpen);
      And("the user moved to the next day", () => world.showNextDay());
      When(
        "the user opens the calendar, shows the next month and closes the calendar without picking",
        async () => {
          await openCalendar();
          await clickByName(i18n.t("date.nextMonth"));
          await clickByName(i18n.t("locations.close"));
        },
      );
      Then("the calendar is closed", thenCalendarClosed);
      And("the shown date is {string}", (_ctx, isoDate: string) =>
        expect(world.shownIsoDate()).toBe(isoDate),
      );
      And("the Now button is active", () =>
        expect(world.isNowActive()).toBe(true),
      );
    },
  );
});
