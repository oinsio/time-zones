// Verifies FR6, UX1 of refine-meeting-range-entry-and-handles.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import { expect } from "vitest";
import { createMeetingGridSession } from "../../grid_view/steps/meetingGridSession";
import {
  endFieldOf,
  openMeetingRangeInput,
  openWallTimeInput,
  startFieldOf,
  typeInField,
  wallTimeFieldOf,
} from "../../grid_view/steps/meetingInputQueries";

const feature = await loadFeature(
  "../time_selection_time_separator_unit.feature",
);

const CITY = "Almaty";
const SHOWN_SEPARATOR = ", ";
const WALL_TIME_INPUT = "the wall-time input";
const START_FIELD_INPUT = "the start field of the meeting range input";
const WALL_TIME_ERROR = "Enter the time as HH:MM";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const session = createMeetingGridSession();
  let field: HTMLElement;

  f.BeforeEachScenario(async () => {
    await session.reset();
  });
  f.AfterAllScenarios(session.world.finish);

  const openWallTimeField = async () => {
    await session.openGrid();
    await openWallTimeInput(CITY);
    field = wallTimeFieldOf(CITY);
  };
  const openMeetingRangeField = async (name: string) => {
    await session.openGridWithSampleMeeting();
    await openMeetingRangeInput(CITY);
    field = name === START_FIELD_INPUT ? startFieldOf(CITY) : endFieldOf(CITY);
  };
  const openInput = (name: string) =>
    name === WALL_TIME_INPUT
      ? openWallTimeField()
      : openMeetingRangeField(name);
  const typeDigitsOneByOne = async (digits: string) => {
    const shownAfterEachDigit: string[] = [];
    await userEvent.clear(field);
    for (const digit of digits) {
      await userEvent.type(field, digit);
      shownAfterEachDigit.push((field as HTMLInputElement).value);
    }
    return shownAfterEachDigit;
  };
  const expectShown = (text: string) => expect(field).toHaveValue(text);

  // @refine-meeting-range-entry-and-handles @FR6 @UX1
  f.ScenarioOutline(
    "Digits typed one by one",
    ({ Given, When, Then }, variables) => {
      let shownAfterEachDigit: string[] = [];
      Given("the user opened <input> of Almaty and its text is selected", () =>
        openInput(variables.input),
      );
      When("the user types the digits <digits> one by one", async () => {
        shownAfterEachDigit = await typeDigitsOneByOne(variables.digits);
      });
      Then("the field shows <shown> after each digit", () => {
        expect(shownAfterEachDigit).toEqual(
          variables.shown.split(SHOWN_SEPARATOR),
        );
      });
    },
  );

  // @refine-meeting-range-entry-and-handles @FR6 @UX1
  f.ScenarioOutline(
    "Texts left as typed",
    ({ Given, When, Then }, variables) => {
      Given("the user opened the wall-time input of Almaty", openWallTimeField);
      When('the user types "<typed>"', async () => {
        await typeInField(field, variables.typed);
      });
      Then('the field shows "<shown>"', () => expectShown(variables.shown));
    },
  );

  // @refine-meeting-range-entry-and-handles @FR6 @UX1
  f.Scenario("Backspace removes the separator", ({ Given, When, Then }) => {
    Given(
      'the wall-time input of Almaty shows "10:3" after typing "103"',
      async () => {
        await openWallTimeField();
        await typeInField(field, "103");
        expectShown("10:3");
      },
    );
    When("the user presses Backspace twice", async () => {
      await userEvent.type(field, "{Backspace}{Backspace}");
    });
    Then("the field shows {string}", (_ctx, shown: string) =>
      expectShown(shown),
    );
    When("the user types {string}", async (_ctx, typed: string) => {
      await userEvent.type(field, typed);
    });
    Then("the field then shows {string}", (_ctx, shown: string) =>
      expectShown(shown),
    );
  });

  // @refine-meeting-range-entry-and-handles @FR6 @UX1
  f.Scenario("A pasted time gets its separator", ({ Given, When, Then }) => {
    Given(
      "the user opened the wall-time input of Almaty with its text selected",
      openWallTimeField,
    );
    When("the user pastes {string}", async (_ctx, pasted: string) => {
      (field as HTMLInputElement).select();
      await userEvent.paste(pasted);
    });
    Then("the field shows {string}", (_ctx, shown: string) =>
      expectShown(shown),
    );
  });

  // @refine-meeting-range-entry-and-handles @FR6 @UX1
  f.ScenarioOutline(
    "Rejected texts stay rejected",
    ({ Given, When, Then }, variables) => {
      Given("the user opened the wall-time input of Almaty", openWallTimeField);
      When('the user types "<typed>" and presses Enter', async () => {
        await typeInField(field, `${variables.typed}{Enter}`);
      });
      Then('the field shows the error "Enter the time as HH:MM"', () => {
        expect(screen.getByText(WALL_TIME_ERROR)).toBeInTheDocument();
        expect(field).toHaveAttribute("aria-invalid", "true");
      });
    },
  );
});
