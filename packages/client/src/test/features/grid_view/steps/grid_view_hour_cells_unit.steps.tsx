import type { FeatureDescriibeCallbackParams } from "@amiceli/vitest-cucumber";
import { describeFeature, loadFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  DayPeriod,
  getReferenceDay,
  INITIAL_WORLD_CLOCK_STATE,
  type ReferenceDay,
} from "@/model";
import { HourFormat } from "@/preferences";
import { type PresentedHourStrip, presentHourStrip } from "@/presenter";
import {
  type HourCellsWorld,
  parseColumnRange,
  ZONE_BY_CITY,
} from "./hourCellsWorld";

const feature = await loadFeature("../grid_view_hour_cells_unit.feature");

const ALL_CITIES = ["Almaty", "Moscow", "Kolkata", "New York"];

describeFeature(feature, (f: FeatureDescriibeCallbackParams) => {
  const world: HourCellsWorld = {
    referenceZoneId: "",
    day: undefined as unknown as ReferenceDay,
    language: "en",
    hourFormat: HourFormat.H24,
  };
  const stripOf = (city: string): PresentedHourStrip =>
    presentHourStrip(ZONE_BY_CITY[city], world);
  const setDay = (instant: string) => {
    world.day = getReferenceDay(
      { ...INITIAL_WORLD_CLOCK_STATE, deviceTimeZoneId: world.referenceZoneId },
      Temporal.Instant.from(instant),
    );
  };
  const setZoneAndDay = (_ctx: unknown, zone: string, instant: string) => {
    world.referenceZoneId = zone;
    setDay(instant);
  };
  const SAMPLE_INSTANT = "2026-03-08T07:30:00Z";
  const givenSampleDay = (_ctx: unknown, zone: string) =>
    setZoneAndDay(_ctx, zone, SAMPLE_INSTANT);
  const setLanguage = (language: "en" | "ru") => {
    world.language = language;
  };
  const labelOf = (city: string, column: number) => {
    const cell = stripOf(city).cells[column];
    return `${cell.hourText}${cell.minuteText}`;
  };

  f.BeforeEachScenario(() => {
    world.language = "en";
    world.hourFormat = HourFormat.H24;
  });

  // @add-grid-hour-cells-and-hour-frame @FR1
  f.Scenario("Four rows of 24 aligned cells", ({ Given, And, When, Then }) => {
    Given(
      "the reference zone is {string} and the current time is {string}",
      setZoneAndDay,
    );
    And("the locations are Almaty, Moscow, Kolkata and New York", () => {});
    When("the hour cells are presented", () => {});
    Then("every row has 24 hour cells", () => {
      for (const city of ALL_CITIES) {
        expect(stripOf(city).cells).toHaveLength(24);
      }
    });
    And("column 12 starts at {string} in every row", (_ctx, start: string) => {
      for (const city of ALL_CITIES) {
        expect(stripOf(city).cells[12].key).toBe(start);
      }
    });
  });

  // @add-grid-hour-cells-and-hour-frame @FR2
  f.ScenarioOutline(
    "Clock change days in the reference zone",
    ({ Given, When, Then }, variables) => {
      Given("the reference zone is {string}", (_ctx, zone: string) => {
        world.referenceZoneId = zone;
      });
      When("the reference day is <date>", () =>
        setDay(`${variables.date}T12:00:00Z`),
      );
      Then("every row has <count> hour cells", () => {
        for (const city of ALL_CITIES) {
          expect(stripOf(city).cells).toHaveLength(Number(variables.count));
        }
      });
    },
  );

  // @add-grid-hour-cells-and-hour-frame @FR3
  f.ScenarioOutline(
    "Local start hours of the sample day",
    ({ Given, When, Then }, variables) => {
      Given(
        "the reference zone is {string}, the current time is {string} and the hour format is 24-hour",
        setZoneAndDay,
      );
      When("the hour cells are presented", () => {});
      Then("column <column> of <city> shows <label>", () =>
        expect(labelOf(variables.city, Number(variables.column))).toBe(
          variables.label,
        ),
      );
    },
  );

  // @add-grid-hour-cells-and-hour-frame @FR3
  f.Scenario("Quarter-hour zone", ({ Given, When, Then }) => {
    Given(
      "the reference zone is {string} and the reference day is 2026-03-08",
      givenSampleDay,
    );
    When("the hour cells of Kathmandu are presented", () => {});
    Then(
      "column 0 is its midnight cell and column 1 shows {string}",
      (_ctx, label: string) => {
        expect(stripOf("Kathmandu").cells[0].midnightMarker).toBeDefined();
        expect(labelOf("Kathmandu", 1)).toBe(label);
      },
    );
  });

  // @add-grid-hour-cells-and-hour-frame @FR3
  f.Scenario("12-hour format", ({ Given, When, Then }) => {
    Given(
      "the reference zone is {string}, the reference day is 2026-03-08, the interface language is English and the hour format is 12-hour",
      (_ctx, zone: string) => {
        givenSampleDay(_ctx, zone);
        setLanguage("en");
        world.hourFormat = HourFormat.H12;
      },
    );
    When("the hour cells of Almaty are presented", () => {});
    Then(
      "column 9 shows {string} with the marker {string} and column 21 shows {string} with the marker {string}",
      (
        _ctx,
        hour: string,
        marker: string,
        hourLater: string,
        markerLater: string,
      ) => {
        const cells = stripOf("Almaty").cells;
        expect([cells[9].hourText, cells[9].dayPeriodMarker]).toEqual([
          hour,
          marker,
        ]);
        expect([cells[21].hourText, cells[21].dayPeriodMarker]).toEqual([
          hourLater,
          markerLater,
        ]);
      },
    );
  });

  // @add-grid-hour-cells-and-hour-frame @FR4
  f.Scenario("Day periods of Almaty", ({ Given, When, Then }) => {
    Given(
      "the reference zone is {string} and the reference day is 2026-03-08",
      givenSampleDay,
    );
    When("the hour cells of Almaty are presented", () => {});
    Then(
      "columns 0-6 and 22-23 are night, 7-8 morning, 9-17 working hours and 18-21 evening",
      () => {
        const expectedPeriods: [string, DayPeriod][] = [
          ["0-6", DayPeriod.NIGHT],
          ["22-23", DayPeriod.NIGHT],
          ["7-8", DayPeriod.MORNING],
          ["9-17", DayPeriod.WORK],
          ["18-21", DayPeriod.EVENING],
        ];
        for (const [range, period] of expectedPeriods) {
          for (const column of parseColumnRange(range)) {
            expect(stripOf("Almaty").cells[column].dayPeriod).toBe(period);
          }
        }
      },
    );
  });

  // @add-grid-hour-cells-and-hour-frame @FR5
  f.ScenarioOutline(
    "Midnight cells of the sample day",
    ({ Given, When, Then }, variables) => {
      Given(
        "the reference zone is {string}, the reference day is 2026-03-08 and the interface language is Russian",
        (_ctx, zone: string) => {
          givenSampleDay(_ctx, zone);
          setLanguage("ru");
        },
      );
      When("the hour cells are presented", () => {});
      Then(
        "the midnight cell of <city> is column <column> with {string} over {string}",
        (_ctx, month: string, day: string) => {
          const midnightColumns = stripOf(variables.city)
            .cells.map((cell, column) => (cell.midnightMarker ? column : -1))
            .filter((column) => column >= 0);
          expect(midnightColumns).toEqual([Number(variables.column)]);
          expect(
            stripOf(variables.city).cells[Number(variables.column)]
              .midnightMarker,
          ).toEqual({ monthText: month, dayText: day });
        },
      );
    },
  );

  // @add-grid-hour-cells-and-hour-frame @FR5
  f.Scenario(
    "The reference zone's row starts with 0",
    ({ Given, When, Then }) => {
      Given(
        "the reference zone is {string} and the reference day is 2026-03-08",
        givenSampleDay,
      );
      When("the hour cells of Almaty are presented", () => {});
      Then(
        "column 0 shows {string} and no cell of Almaty is a midnight cell",
        (_ctx, label: string) => {
          expect(labelOf("Almaty", 0)).toBe(label);
          expect(
            stripOf("Almaty").cells.some((cell) => cell.midnightMarker),
          ).toBe(false);
        },
      );
    },
  );

  // @add-grid-hour-cells-and-hour-frame @FR5
  f.Scenario("English month", ({ Given, When, Then }) => {
    Given(
      "the reference zone is {string}, the reference day is 2026-03-08 and the interface language is English",
      (_ctx, zone: string) => {
        givenSampleDay(_ctx, zone);
        setLanguage("en");
      },
    );
    When("the hour cells of Moscow are presented", () => {});
    Then(
      "column 2 shows {string} over {string}",
      (_ctx, month: string, day: string) => {
        expect(stripOf("Moscow").cells[2].midnightMarker).toEqual({
          monthText: month,
          dayText: day,
        });
      },
    );
  });

  // @add-grid-hour-cells-and-hour-frame @FR6
  f.Scenario(
    "New York moves its clocks forward",
    ({ Given, When, Then, And }) => {
      Given(
        "the reference zone is {string} and the reference day is 2026-03-08",
        givenSampleDay,
      );
      When("the hour cells are presented", () => {});
      Then("New York's column 12 has the offset edge", () => {
        expect(stripOf("New York").cells[12].hasOffsetEdge).toBe(true);
      });
      And(
        "no other cell of New York, Almaty, Moscow or Kolkata has one",
        () => {
          const edgeCells = ALL_CITIES.flatMap((city) =>
            stripOf(city).cells.filter((cell) => cell.hasOffsetEdge),
          );
          expect(edgeCells).toHaveLength(1);
        },
      );
    },
  );
});
