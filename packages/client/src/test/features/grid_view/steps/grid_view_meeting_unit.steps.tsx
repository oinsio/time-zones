// Verifies FR5, FR7, FR8, FR13, FR15 of add-grid-meeting-range-and-share.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { fireEvent, screen } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import { ADD_LOCATION_BUTTON_ID } from "@/constants";
import type { InterfaceLanguageCode } from "@/locales";
import {
  clickButton,
  dimmedColumnsOf,
  frameColumns,
  hasDayShiftMark,
  hourFrameColumn,
  isColumnDimmed,
  meetingTitle,
  pressOnHandle,
  setMeetingOfMinutes,
  spanOf,
  stripOf,
  tapColumn,
} from "./meetingGridQueries";
import { ALL_CITIES, createMeetingGridSession } from "./meetingGridSession";

const feature = await loadFeature("../grid_view_meeting_unit.feature");

const LANGUAGES: Record<string, InterfaceLanguageCode> = {
  Russian: "ru",
  English: "en",
};
const DIMMED_PER_ROW = 22;
const MEETING_COLUMNS = [9, 10];
const RUSSIAN_CITY_NAMES: Record<string, string> = {
  Almaty: "Алматы",
  Moscow: "Москва",
  Kolkata: "Калькутта",
  "New York": "Нью-Йорк",
};
const NO_MARK = "no day shift mark";
const CLEAR_BUTTON = "Clear meeting";
const FIRST_FRAME_COLUMNS = "9-10";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const { world, openGrid, openGridWithSampleMeeting, setLanguage, reset } =
    createMeetingGridSession();

  f.BeforeEachScenario(reset);
  f.AfterAllScenarios(world.finish);

  // @add-grid-meeting-range-and-share @FR5
  f.Scenario("Tap on column 9", ({ Given, When, Then, And }) => {
    Given(
      "the view mode is Grid, the reference zone is {string}, the current time is {string}, live, and the stored locations are Almaty, Moscow, Kolkata and New York",
      () => openGrid(),
    );
    When("the user taps column 9 of Moscow", () => {
      tapColumn("Moscow", 9);
    });
    Then("the meeting range is 09:00–10:00 in Almaty", () =>
      expect(spanOf("Almaty")).toBe("09:00–10:00"),
    );
    And(
      "Almaty shows {string} and the title is {string}",
      (_ctx, span: string, title: string) => {
        expect(spanOf("Almaty")).toBe(span);
        expect(meetingTitle()).toHaveTextContent(title);
      },
    );
  });

  // @add-grid-meeting-range-and-share @FR5
  f.Scenario("Enter on an hour strip", ({ Given, When, Then }) => {
    Given("the Grid view at {string}, live, with Almaty and Moscow", () =>
      openGrid(["Almaty", "Moscow"]),
    );
    When("the user focuses Almaty's hour strip and presses Enter", () => {
      stripOf("Almaty").focus();
      fireEvent.keyDown(stripOf("Almaty"), { key: "Enter" });
    });
    Then("the meeting range is 12:00–13:00 in Almaty", () =>
      expect(spanOf("Almaty")).toBe("12:00–13:00"),
    );
  });

  // @add-grid-meeting-range-and-share @FR7
  f.Scenario(
    "Frame and dimming of the sample meeting",
    ({ Given, When, Then, And }) => {
      Given(
        "the Grid view with Almaty, Moscow, Kolkata and New York and the meeting range 09:00–11:00 in Almaty on 2026-03-08",
        () => openGridWithSampleMeeting(),
      );
      When("the main page is shown", () => {
        expect(screen.getAllByRole("slider").length).toBeGreaterThan(0);
      });
      Then("the meeting frame encloses columns 9 and 10 of every row", () =>
        expect(frameColumns()).toBe(FIRST_FRAME_COLUMNS),
      );
      And(
        "22 cells of every row are dimmed and columns 9 and 10 are not",
        () => {
          for (const city of ALL_CITIES) {
            expect(dimmedColumnsOf(city)).toHaveLength(DIMMED_PER_ROW);
            for (const column of MEETING_COLUMNS) {
              expect(isColumnDimmed(city, column)).toBe(false);
            }
          }
        },
      );
      And("no hour frame is shown", () => expect(hourFrameColumn()).toBeNull());
    },
  );

  // @add-grid-meeting-range-and-share @FR7
  f.Scenario("A quarter-hour range", ({ Given, When, Then }) => {
    Given(
      "the meeting range is 09:15–10:30 in Almaty on 2026-03-08",
      async () => {
        await openGrid(["Almaty", "Moscow"]);
        tapColumn("Almaty", 9);
        pressOnHandle("startHandle", "ArrowRight");
        pressOnHandle("endHandle", "PageUp");
        pressOnHandle("endHandle", "ArrowLeft", 2);
        expect(spanOf("Almaty")).toBe("09:15–10:30");
      },
    );
    When("the Grid view is shown", () => {
      expect(screen.getAllByRole("slider").length).toBeGreaterThan(0);
    });
    Then("columns 9 and 10 are not dimmed and every other column is", () => {
      const dimmed = dimmedColumnsOf("Almaty");
      expect(dimmed).toHaveLength(DIMMED_PER_ROW);
      expect(dimmed).not.toContain(9);
      expect(dimmed).not.toContain(10);
    });
  });

  // @add-grid-meeting-range-and-share @FR8
  f.ScenarioOutline(
    "Spans of the sample meeting",
    ({ Given, When, Then }, variables) => {
      Given(
        "the interface language is Russian, the hour format is 24-hour and the meeting range is 09:00–11:00 in Almaty on 2026-03-08",
        async () => {
          setLanguage("ru");
          await openGridWithSampleMeeting();
        },
      );
      When("the Grid view is shown", () => {
        expect(frameColumns()).toBe(FIRST_FRAME_COLUMNS);
      });
      Then("<city> shows <span> and <mark>", async () => {
        const city = RUSSIAN_CITY_NAMES[variables.city];
        await screen.findByRole("button", {
          name: i18n.t("locations.locationMenu", { city }),
        });
        expect(spanOf(city)).toBe(variables.span);
        expect(hasDayShiftMark(city)).toBe(variables.mark !== NO_MARK);
      });
    },
  );

  // @add-grid-meeting-range-and-share @FR8 @FR13
  f.Scenario("Clear returns the times", ({ Given, When, Then }) => {
    Given("the sample meeting is set", () => openGridWithSampleMeeting());
    When("the user clears the meeting range", () => {
      clickButton(CLEAR_BUTTON);
    });
    Then(
      "every row shows its single time again and no row shows a day shift mark",
      () => {
        for (const city of ALL_CITIES) {
          expect(world.timeOf(city)).not.toContain("–");
          expect(hasDayShiftMark(city)).toBe(false);
        }
      },
    );
  });

  // @add-grid-meeting-range-and-share @FR13
  f.ScenarioOutline(
    "Durations in the title",
    ({ Given, When, Then }, variables) => {
      Given("the interface language is <language>", async () => {
        setLanguage(LANGUAGES[variables.language]);
        await openGrid(["Almaty", "Moscow"]);
      });
      When("the meeting range lasts <minutes> minutes", () =>
        setMeetingOfMinutes(Number(variables.minutes)),
      );
      Then("the title is <title>", () =>
        expect(meetingTitle()).toHaveTextContent(variables.title),
      );
    },
  );

  // @add-grid-meeting-range-and-share @FR13
  f.Scenario("Clear meeting", ({ Given, When, Then, And }) => {
    Given("the Grid view with the sample meeting", () =>
      openGridWithSampleMeeting(),
    );
    When("the user chooses {string}", (_ctx, name: string) => {
      clickButton(name);
    });
    Then(
      "no meeting range is set, the hour frame is on column 9 and the header shows {string} with Add location and Settings",
      (_ctx, title: string) => {
        expect(frameColumns()).toBeNull();
        expect(hourFrameColumn()).toBe(9);
        expect(meetingTitle()).toHaveTextContent(title);
        expect(
          document.getElementById(ADD_LOCATION_BUTTON_ID),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: i18n.t("settings.open") }),
        ).toBeInTheDocument();
      },
    );
    And("the Add location button has the focus", () =>
      expect(document.activeElement).toBe(
        document.getElementById(ADD_LOCATION_BUTTON_ID),
      ),
    );
  });

  // @add-grid-meeting-range-and-share @FR7 @FR13
  f.Scenario("No hour frame during a meeting", ({ Given, When, Then }) => {
    Given(
      "the Grid view at {string} with the meeting range 09:00–11:00 in Almaty",
      () => openGridWithSampleMeeting(),
    );
    When("the main page is shown", () => {
      expect(frameColumns()).toBe(FIRST_FRAME_COLUMNS);
    });
    Then("no hour frame is shown", () => expect(hourFrameColumn()).toBeNull());
    When("the user clears the meeting range", () => {
      clickButton(CLEAR_BUTTON);
    });
    Then("the hour frame is on column 9", () =>
      expect(hourFrameColumn()).toBe(9),
    );
  });
});
