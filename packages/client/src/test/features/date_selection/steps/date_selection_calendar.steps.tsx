import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { act, renderHook, screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import type { ReactNode } from "react";
import { expect } from "vitest";
import { createInMemoryLocationRepository } from "@/adapters";
import {
  LocationsProvider,
  useCalendarMonth,
  useReferenceMoment,
} from "@/controller";
import { Temporal } from "@/lib/temporal";
import {
  createStore,
  INITIAL_LOCATIONS_STATE,
  LocationCommandType,
  LocationErrorCode,
  type LocationsState,
  ReferenceMode,
  reduceLocations,
  WallClockStatus,
} from "@/model";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import { immediateWriteScheduler } from "@/test/writeSchedulers";
import {
  createDateSelectionWorld,
  RUSSIAN_LANGUAGE,
} from "./dateSelectionWorld";

const feature = await loadFeature("../date_selection_calendar.feature");

const NEXT_MONTH_COUNT = 4;
const LAST_SUPPORTED_INSTANT = "+275760-09-13T00:00:00Z";
const STORE_NOW = "2026-03-08T07:30:00Z";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world = createDateSelectionWorld();
  let calendarHook: ReturnType<typeof renderCalendarHook>;
  let store = createStore(reduceLocations, INITIAL_LOCATIONS_STATE);
  let lastOutcome: ReturnType<typeof store.dispatch>;

  const renderCalendarHook = (initialFocusedIsoDate: string) =>
    renderHook(
      (props: { focused: string }) => ({
        reference: useReferenceMoment(),
        month: useCalendarMonth(props.focused),
      }),
      {
        initialProps: { focused: initialFocusedIsoDate },
        wrapper: ({ children }: { children: ReactNode }) => (
          <LocationsProvider
            repository={createInMemoryLocationRepository()}
            writeScheduler={immediateWriteScheduler}
            clock={world.clock()}
            tickScheduler={createManualTickScheduler()}
          >
            {children}
          </LocationsProvider>
        ),
      },
    );

  f.BeforeEachScenario(async () => {
    await world.reset();
    store = createStore(reduceLocations, INITIAL_LOCATIONS_STATE);
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
  const monthOf = () => calendarHook.result.current.month.month;
  const isoRow = (weekIndex: number) =>
    monthOf().weeks[weekIndex]?.map((cell) => cell?.isoDate ?? null);

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
      And("the Now button is shown", () =>
        expect(world.isNowShown()).toBe(true),
      );
    },
  );

  // @select-date-with-calendar-and-now @FR3
  f.Scenario(
    "The calendar opens on the pinned date",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      And(
        "the moment is pinned by picking {string}",
        (_ctx, isoDate: string) => {
          calendarHook = renderCalendarHook(isoDate);
          act(() => calendarHook.result.current.reference.selectDate(isoDate));
        },
      );
      When("the user opens the calendar", () => {
        calendarHook.rerender({
          focused: calendarHook.result.current.reference.dateBar.isoDate,
        });
      });
      Then("it shows July 2026 with 15 July selected", () => {
        expect(monthOf().heading).toBe("July 2026");
        const selectedCells = monthOf()
          .weeks.flat()
          .filter((cell) => cell?.isSelected);
        expect(selectedCells.map((cell) => cell?.isoDate)).toEqual([
          "2026-07-15",
        ]);
      });
      And("no day of July 2026 is marked as today", () =>
        expect(
          monthOf()
            .weeks.flat()
            .some((cell) => cell?.isToday),
        ).toBe(false),
      );
    },
  );

  // @select-date-with-calendar-and-now @FR3 @FR9 @M4
  f.Scenario(
    "March 2026 in English and Russian",
    ({ Given, And, When, Then }) => {
      Given("the device time zone is {string}", givenZone);
      And("the current instant is {string}", givenInstant);
      When("the calendar shows March 2026", () => {
        calendarHook = renderCalendarHook("2026-03-01");
      });
      Then(
        "in English the heading is {string}, there are 5 week rows and the first row starts with Sunday 1 March",
        (_ctx, heading: string) => {
          expect(monthOf().heading).toBe(heading);
          expect(monthOf().weeks).toHaveLength(5);
          expect(isoRow(0)?.[0]).toBe("2026-03-01");
        },
      );
      And(
        "in Russian there are 6 week rows, the first row ends with Sunday 1 March and the second row starts with Monday 2 March",
        async () => {
          await act(() => i18n.changeLanguage(RUSSIAN_LANGUAGE));
          expect(monthOf().weeks).toHaveLength(6);
          expect(isoRow(0)?.[6]).toBe("2026-03-01");
          expect(isoRow(1)?.[0]).toBe("2026-03-02");
        },
      );
    },
  );

  // @select-date-with-calendar-and-now @FR2 @FR10
  f.Scenario(
    "A move beyond the supported range changes nothing",
    ({ Given, When, Then, And }) => {
      let stateBefore: LocationsState;
      Given(
        "the moment is pinned to the last date the platform supports",
        () => {
          stateBefore = {
            ...INITIAL_LOCATIONS_STATE,
            reference: {
              mode: ReferenceMode.PINNED,
              instant: Temporal.Instant.from(LAST_SUPPORTED_INSTANT),
              wallClockStatus: WallClockStatus.UNIQUE,
              requestedWallTime: Temporal.PlainTime.from("00:00"),
            },
          };
          store = createStore(reduceLocations, stateBefore);
        },
      );
      When("the user moves to the next day in the store", () => {
        lastOutcome = store.dispatch({
          type: LocationCommandType.SHIFT_DATE,
          days: 1,
          now: STORE_NOW,
        });
      });
      Then("the move is rejected as out of range", () =>
        expect(lastOutcome).toEqual({
          ok: false,
          error: LocationErrorCode.DATE_OUT_OF_RANGE,
        }),
      );
      And("the moment is unchanged in the store", () =>
        expect(store.getSnapshot()).toBe(stateBefore),
      );
    },
  );
});
