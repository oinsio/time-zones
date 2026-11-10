// Verifies FR1, FR2, FR3, FR4, UX1 of fix-grid-meeting-range-lock-and-layering.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";

import { expect } from "vitest";
import { HourFormat } from "@/preferences";
import { getCardOf } from "../../locations/steps/deviceTimeQueries";
import {
  clickButton,
  setSampleMeeting,
  spanOf,
  tapColumn,
} from "./meetingGridQueries";
import { ALL_CITIES, createMeetingGridSession } from "./meetingGridSession";
import {
  endFieldOf,
  enterMeetingRange,
  expectRowControlsFree,
  expectRowControlsLocked,
  hasWallTimeInput,
  openMeetingRangeInput,
  spanButtonOf,
  startFieldOf,
  timeButtonOf,
  typeInField,
} from "./meetingInputQueries";

const feature = await loadFeature("../grid_view_meeting_lock_unit.feature");

const SAMPLE_SPAN = "09:00–11:00";
const RUSSIAN_CITY_NAMES: Record<string, string> = {
  Almaty: "Алматы",
  Moscow: "Москва",
  Kolkata: "Калькутта",
  "New York": "Нью-Йорк",
};
const CLEAR_BUTTON = "Clear meeting";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const session = createMeetingGridSession();
  const { world, openGrid, openGridWithSampleMeeting, setLanguage, reset } =
    session;
  let isRussian = false;
  const labelOf = (city: string) =>
    isRussian ? RUSSIAN_CITY_NAMES[city] : city;
  const openRussianGrid = async (cities: string[] = ALL_CITIES) => {
    isRussian = true;
    setLanguage("ru");
    await openGrid(cities);
  };
  const expectFirstRowSpan = (span: string) =>
    expect(
      within(getCardOf(labelOf("Almaty"))).getByRole("button", {
        name: /^Enter meeting time|^Ввести время встречи/,
      }).textContent,
    ).toBe(span);

  f.BeforeEachScenario(async () => {
    isRussian = false;
    await reset();
  });
  f.AfterAllScenarios(world.finish);

  // @fix-grid-meeting-range-lock-and-layering @FR1 @FR2 @UX1
  f.Scenario(
    "Controls are locked during the meeting and free after it",
    ({ Given, When, Then, And }) => {
      Given(
        "the Grid view with Almaty, Moscow, Kolkata and New York at {string}",
        () => openGrid(),
      );
      When("the user sets the meeting range 09:00–11:00 in Almaty", () =>
        setSampleMeeting(),
      );
      Then(
        "every drag handle and every location menu button is disabled and dimmed",
        () => expectRowControlsLocked(),
      );
      And("no row offers the wall-time input", () => {
        for (const city of ALL_CITIES) {
          expect(
            within(getCardOf(city)).queryByRole("button", {
              name: /^Enter time/,
            }),
          ).toBeNull();
        }
      });
      When(
        "the user clears the meeting range",
        () => void clickButton(CLEAR_BUTTON),
      );
      Then("every drag handle and every location menu button is enabled", () =>
        expectRowControlsFree(),
      );
      And("every row's time opens the wall-time input", async () => {
        for (const city of ALL_CITIES) {
          await userEvent.click(timeButtonOf(city));
          expect(hasWallTimeInput(city)).toBe(true);
          await userEvent.keyboard("{Escape}");
        }
      });
    },
  );

  // @fix-grid-meeting-range-lock-and-layering @FR1 @FR2 @UX1
  f.Scenario(
    "Setting a meeting range closes an open location menu",
    ({ Given, When, Then }) => {
      Given(
        "the Grid view with Almaty and Moscow and Moscow's location menu open",
        async () => {
          await openGrid(["Almaty", "Moscow"]);
          await userEvent.click(
            screen.getByRole("button", { name: "Actions for Moscow" }),
          );
          expect(screen.getByRole("menu")).toBeInTheDocument();
        },
      );
      When("the user taps column 9 of Almaty", () => {
        tapColumn("Almaty", 9);
      });
      Then(
        "the meeting range is 09:00–10:00 in Almaty and no location menu is open",
        () => {
          expect(spanOf("Almaty")).toBe("09:00–10:00");
          expect(screen.queryByRole("menu")).toBeNull();
        },
      );
    },
  );

  // @fix-grid-meeting-range-lock-and-layering @FR1 @FR2 @UX1
  f.Scenario(
    "Cards keeps its controls with a meeting range",
    ({ Given, When, Then }) => {
      Given("the meeting range 09:00–11:00 in Almaty was set in Grid", () =>
        openGridWithSampleMeeting(),
      );
      When("the view mode is changed to Cards", () =>
        world.receiveCardsViewFromAnotherTab("en"),
      );
      Then(
        "every drag handle and every location menu button is enabled and every time opens the wall-time input",
        async () => {
          expectRowControlsFree();
          for (const city of ALL_CITIES) {
            await userEvent.click(timeButtonOf(city));
            expect(hasWallTimeInput(city)).toBe(true);
            await userEvent.keyboard("{Escape}");
          }
        },
      );
    },
  );

  // @fix-grid-meeting-range-lock-and-layering @FR3 @FR4
  f.ScenarioOutline(
    "Type the meeting in another location's time",
    ({ Given, When, Then }, variables) => {
      Given(
        "the Grid view with Almaty, Moscow, Kolkata and New York, Russian interface, 24-hour format and the meeting range 09:00–11:00 in Almaty on 2026-03-08",
        async () => {
          await openRussianGrid();
          setSampleMeeting();
        },
      );
      When(
        'the user opens the meeting range input of "<city>" and enters "<start>" and "<end>"',
        () =>
          enterMeetingRange(
            labelOf(variables.city),
            variables.start,
            variables.end,
          ),
      );
      Then(
        'the meeting range is "<range>" in Almaty and the input is closed',
        () => {
          expectFirstRowSpan(variables.range);
          expect(screen.queryByRole("textbox")).toBeNull();
        },
      );
    },
  );

  // @fix-grid-meeting-range-lock-and-layering @FR4
  f.Scenario("Twelve-hour texts", ({ Given, When, Then }) => {
    Given(
      "the sample meeting, English interface and 12-hour format",
      async () => {
        session.setHourFormat(HourFormat.H12);
        await openGridWithSampleMeeting();
      },
    );
    When(
      'the user opens the meeting range input of "Almaty" and enters "10 am" and "12:30 pm"',
      () => enterMeetingRange("Almaty", "10 am", "12:30 pm"),
    );
    Then(
      'the meeting range is "10:00 AM–12:30 PM" in Almaty and the input is closed',
      () => {
        expectFirstRowSpan("10:00 AM–12:30 PM");
        expect(screen.queryByRole("textbox")).toBeNull();
      },
    );
  });

  // @fix-grid-meeting-range-lock-and-layering @FR4
  f.ScenarioOutline(
    "Wrong input keeps the input open",
    ({ Given, When, Then, And }, variables) => {
      Given(
        "the sample meeting in the Grid view, Russian interface",
        async () => {
          await openRussianGrid();
          setSampleMeeting();
        },
      );
      When(
        'the user opens the meeting range input of "<city>" and enters "<start>" and "<end>"',
        () =>
          enterMeetingRange(
            labelOf(variables.city),
            variables.start,
            variables.end,
          ),
      );
      Then('the input stays open with the error "<error>"', () => {
        const card = getCardOf(labelOf(variables.city));
        expect(within(card).getByText(variables.error)).toBeInTheDocument();
        expect(startFieldOf(labelOf(variables.city))).toBeInTheDocument();
      });
      And("the meeting range is still 09:00–11:00", async () => {
        await userEvent.keyboard("{Escape}");
        expectFirstRowSpan(SAMPLE_SPAN);
      });
    },
  );

  // @fix-grid-meeting-range-lock-and-layering @FR4
  f.Scenario(
    "Esc closes the input without a change",
    ({ Given, When, Then }) => {
      Given(
        'the sample meeting and Moscow\'s meeting range input open with "8" typed in the start field',
        async () => {
          await openGridWithSampleMeeting();
          await openMeetingRangeInput("Moscow");
          await typeInField(startFieldOf("Moscow"), "8");
        },
      );
      When("the user presses Esc", async () => {
        await userEvent.keyboard("{Escape}");
      });
      Then(
        "the input is closed, the meeting range is still 09:00–11:00 and the focus is on Moscow's span",
        () => {
          expect(screen.queryByRole("textbox")).toBeNull();
          expectFirstRowSpan(SAMPLE_SPAN);
          expect(spanButtonOf("Moscow")).toHaveFocus();
        },
      );
    },
  );

  // @fix-grid-meeting-range-lock-and-layering @FR3 @FR4
  f.Scenario(
    "The span opens the meeting range input",
    ({ Given, When, Then, And }) => {
      Given("the sample meeting is set", () => openGridWithSampleMeeting());
      When("the user activates Moscow's span", () =>
        openMeetingRangeInput("Moscow"),
      );
      Then(
        'the meeting range input of Moscow opens with "07:00" and "09:00"',
        () => {
          expect(startFieldOf("Moscow")).toHaveValue("07:00");
          expect(endFieldOf("Moscow")).toHaveValue("09:00");
        },
      );
      And("no wall-time input opens", () =>
        expect(hasWallTimeInput("Moscow")).toBe(false),
      );
    },
  );

  // @fix-grid-meeting-range-lock-and-layering @FR1 @FR2 @FR3
  f.Scenario(
    "No wall-time input in Grid while a meeting range is set",
    ({ Given, When, Then }) => {
      Given(
        "the Grid view with Almaty and Moscow and the meeting range 09:00–11:00 in Almaty on 2026-03-08",
        async () => {
          await openGrid(["Almaty", "Moscow"]);
          setSampleMeeting();
        },
      );
      When("the user activates Moscow's span", () =>
        openMeetingRangeInput("Moscow"),
      );
      Then(
        "the meeting range input of Moscow opens and no wall-time input opens",
        () => {
          expect(startFieldOf("Moscow")).toBeInTheDocument();
          expect(hasWallTimeInput("Moscow")).toBe(false);
        },
      );
      When(
        "the user clears the meeting range and activates Moscow's time",
        async () => {
          clickButton(CLEAR_BUTTON);
          await userEvent.click(timeButtonOf("Moscow"));
        },
      );
      Then("the wall-time input of Moscow opens", () =>
        expect(hasWallTimeInput("Moscow")).toBe(true),
      );
    },
  );
});
