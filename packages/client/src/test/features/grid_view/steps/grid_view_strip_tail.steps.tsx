// Verifies FR6, FR7, NFR-P1 of move-meeting-range-and-extend-past-midnight.
import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { screen } from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  getReferenceDay,
  getStripTailCellCount,
  getZoneCoordinates,
  INITIAL_WORLD_CLOCK_STATE,
} from "@/model";
import { HourFormat } from "@/preferences";
import { presentHourStrip } from "@/presenter";
import { TIME_OF_DAY_CONTEXT } from "@/test/dayColouringContext";
import { startWorkCount } from "@/test/workCounters";
import {
  HOUR_STRIP_BUDGET_ROW_COUNT,
  HOUR_STRIP_BUDGET_ZONES,
} from "./hourStripBudgetWorld";
import {
  clickButton,
  dimmedColumnsOf,
  frameColumns,
  pressOnHandle,
  stripOf,
  tapColumn,
} from "./meetingGridQueries";
import { createMeetingGridSession } from "./meetingGridSession";

const feature = await loadFeature("../grid_view_strip_tail.feature");

type EndKey = { key: string; times: number };
/** How the keyboard sets a range: the column tapped, then the keys pressed on the end handle. */
const RANGES: Record<string, { column: number; endKeys: EndKey[] }> = {
  "09:00–11:00": { column: 9, endKeys: [{ key: "PageUp", times: 1 }] },
  "21:00–23:00": { column: 21, endKeys: [{ key: "PageUp", times: 1 }] },
  "22:00–23:30": { column: 22, endKeys: [{ key: "ArrowRight", times: 2 }] },
  "22:00–24:00": { column: 22, endKeys: [{ key: "PageUp", times: 1 }] },
  "22:00–00:15 of the next day": {
    column: 22,
    endKeys: [
      { key: "PageUp", times: 1 },
      { key: "ArrowRight", times: 1 },
    ],
  },
  "23:00–02:00 of the next day": {
    column: 23,
    endKeys: [{ key: "PageUp", times: 2 }],
  },
};
const RUSSIAN_CITY_NAMES: Record<string, string> = {
  Almaty: "Алматы",
  Moscow: "Москва",
  Kolkata: "Калькутта",
  "New York": "Нью-Йорк",
};
const PAST_MIDNIGHT_RANGE = "23:00–02:00 of the next day";
const REFERENCE_DAY_CELL_COUNT = 24;
const MIDNIGHT_MONTH = "МАР";
const MIDNIGHT_DAY = "9";
const FRAME_COLUMNS_OF_PAST_MIDNIGHT = "23-25";
const DIMMED_OUTSIDE_FRAME = [
  ...Array.from({ length: 23 }, (_, column) => column),
  26,
];
const CLEAR_BUTTON = "Clear meeting";
const REFERENCE_ZONE = "Asia/Almaty";
const SAMPLE_INSTANT = "2026-03-08T07:30:00Z";
const GROWN_END = "2026-03-08T18:30:00Z";
const BEFORE_END = "2026-03-08T18:00:00Z";
const MEETING_START = "2026-03-08T16:00:00Z";

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const { world, openGrid, setLanguage, reset } = createMeetingGridSession();

  let isRussian = false;
  const labelOf = (city: string) =>
    isRussian ? RUSSIAN_CITY_NAMES[city] : city;
  const setRange = (range: string) => {
    const { column, endKeys } = RANGES[range];
    tapColumn(labelOf("Almaty"), column);
    for (const { key, times } of endKeys)
      pressOnHandle("endHandle", key, times);
  };
  const cellsOf = (city: string) =>
    stripOf(labelOf(city)).querySelectorAll<HTMLElement>("[data-hour-cell]");

  f.BeforeEachScenario(async () => {
    isRussian = false;
    await reset();
  });
  f.AfterAllScenarios(world.finish);

  // @move-meeting-range-and-extend-past-midnight @FR6
  f.ScenarioOutline(
    "Strip tail of a meeting past midnight",
    ({ Given, When, Then }, variables) => {
      Given(
        'the Grid view with Almaty, Moscow, Kolkata and New York on 2026-03-08, reference zone "Asia/Almaty"',
        () => openGrid(),
      );
      When("the meeting range is <range> in Almaty", () =>
        setRange(variables.range),
      );
      Then(
        "every row has <count> hour cells, <tail> of them in the strip tail",
        () => {
          for (const city of ["Almaty", "Moscow", "Kolkata", "New York"]) {
            expect(cellsOf(city)).toHaveLength(Number(variables.count));
          }
          expect(Number(variables.count) - REFERENCE_DAY_CELL_COUNT).toBe(
            Number(variables.tail),
          );
        },
      );
    },
  );

  // @move-meeting-range-and-extend-past-midnight @FR6
  f.Scenario("The tail goes away with the meeting", ({ Given, When, Then }) => {
    Given(
      "the meeting range is 23:00 on 2026-03-08 to 02:00 on 2026-03-09 in Almaty",
      async () => {
        await openGrid();
        setRange(PAST_MIDNIGHT_RANGE);
      },
    );
    When('the user chooses "Clear meeting"', () => {
      clickButton(CLEAR_BUTTON);
    });
    Then("every row has 24 hour cells", () => {
      expect(cellsOf("Almaty")).toHaveLength(REFERENCE_DAY_CELL_COUNT);
    });
  });

  // @move-meeting-range-and-extend-past-midnight @FR7
  f.ScenarioOutline(
    "Midnight cells of the strip tail",
    ({ Given, When, Then }, variables) => {
      Given(
        "the Grid view in Russian with the meeting range 23:00 on 2026-03-08 to 02:00 on 2026-03-09 in Almaty",
        async () => {
          isRussian = true;
          setLanguage("ru");
          await i18n.changeLanguage("ru");
          await openGrid();
          setRange(PAST_MIDNIGHT_RANGE);
        },
      );
      When("the hour cells are presented", () => {
        expect(screen.getAllByRole("slider").length).toBeGreaterThan(0);
      });
      Then(
        'the cell of "<city>" in column <column> shows "МАР" over "9"',
        () => {
          const cell = cellsOf(variables.city)[Number(variables.column)];
          expect(cell.textContent).toBe(`${MIDNIGHT_MONTH}${MIDNIGHT_DAY}`);
        },
      );
    },
  );

  // @move-meeting-range-and-extend-past-midnight @FR7
  f.Scenario("Frame over the strip tail", ({ Given, When, Then, And }) => {
    Given(
      "the meeting range is 23:00 on 2026-03-08 to 02:00 on 2026-03-09 in Almaty",
      async () => {
        await openGrid();
        setRange(PAST_MIDNIGHT_RANGE);
      },
    );
    When("the main page is shown", () => {
      expect(screen.getAllByRole("slider").length).toBeGreaterThan(0);
    });
    Then("the meeting frame encloses columns 23, 24 and 25 of every row", () =>
      expect(frameColumns()).toBe(FRAME_COLUMNS_OF_PAST_MIDNIGHT),
    );
    And("column 26 and columns 0 to 22 are dimmed", () => {
      expect(dimmedColumnsOf(labelOf("Moscow"))).toEqual(DIMMED_OUTSIDE_FRAME);
    });
  });

  // @move-meeting-range-and-extend-past-midnight @FR6 @NFR-P1
  f.Scenario(
    "A growing tail presents only its cells",
    ({ Given, When, Then }) => {
      const day = getReferenceDay(
        { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: REFERENCE_ZONE },
        Temporal.Instant.from(SAMPLE_INSTANT),
      );
      const presentRows = (end: string) => {
        const tailCellCount = getStripTailCellCount(
          {
            start: Temporal.Instant.from(MEETING_START),
            end: Temporal.Instant.from(end),
          },
          day,
          REFERENCE_ZONE,
        );
        return Array.from({ length: HOUR_STRIP_BUDGET_ROW_COUNT }, (_, row) => {
          const zone =
            HOUR_STRIP_BUDGET_ZONES[row % HOUR_STRIP_BUDGET_ZONES.length];
          return presentHourStrip(zone, {
            day,
            coordinates: getZoneCoordinates(zone),
            referenceZoneId: REFERENCE_ZONE,
            language: "en",
            hourFormat: HourFormat.H24,
            ...TIME_OF_DAY_CONTEXT,
            tailCellCount,
          });
        });
      };
      let before: ReturnType<typeof presentRows> = [];
      let after: ReturnType<typeof presentRows> = [];
      let workCount: ReturnType<typeof startWorkCount> | undefined;

      Given(
        "the 50 rows and hour strips with the meeting range 21:00–23:00 in Almaty were presented",
        () => {
          before = presentRows(BEFORE_END);
        },
      );
      When("the end of the meeting range moves to 23:30", () => {
        workCount = startWorkCount();
        after = presentRows(GROWN_END);
        workCount.stop();
      });
      Then(
        "one new hour cell per row is presented and no cell of the reference day is presented again",
        () => {
          expect(workCount?.transitionLookups()).toBeLessThanOrEqual(
            HOUR_STRIP_BUDGET_ZONES.length,
          );
          after.forEach((strip, row) => {
            expect(strip.cells).toHaveLength(before[row].cells.length + 1);
            expect(
              before[row].cells.every(
                (cell, column) => cell === strip.cells[column],
              ),
            ).toBe(true);
          });
        },
      );
    },
  );
});
