// Verifies FR1, FR2, FR3, FR4, UX1 of fix-grid-meeting-range-lock-and-layering.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";

import { expect } from "vitest";
import { getCardOf } from "../../locations/steps/deviceTimeQueries";
import {
  clickButton,
  setSampleMeeting,
  spanOf,
  tapColumn,
} from "./meetingGridQueries";
import { ALL_CITIES, createMeetingGridSession } from "./meetingGridSession";
import {
  expectRowControlsFree,
  expectRowControlsLocked,
  hasWallTimeInput,
  openMeetingRangeInput,
  startFieldOf,
  timeButtonOf,
} from "./meetingInputQueries";

const feature = await loadFeature("../grid_view_meeting_lock_unit.feature");

const CLEAR_BUTTON = "Clear meeting";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const session = createMeetingGridSession();
  const { world, openGrid, openGridWithSampleMeeting, reset } = session;

  f.BeforeEachScenario(async () => {
    await reset();
  });

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
