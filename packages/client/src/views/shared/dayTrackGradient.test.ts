// Verifies FR6 of add-time-sliders-to-location-cards (D7).
// Verifies FR2, FR9–FR13 of add-day-colouring-setting.
import { describe, expect, it } from "vitest";
import { DayColour, type DayColourStop } from "@/presenter";
import {
  buildDayTrackGradient,
  DAY_COLOUR_FOREGROUND_CLASS_NAMES,
  DAY_COLOUR_VARIABLES,
  formatPercent,
} from "./dayTrackGradient";

const COLOUR_STOP_PATTERN = /var\(--[a-z-]+\) [\d.-]+%/g;

describe("buildDayTrackGradient", () => {
  it("should turn the Almaty stops into a token gradient", () => {
    const gradient = buildDayTrackGradient([
      { fraction: 0.2708333333, colour: DayColour.NIGHT },
      { fraction: 0.3125, colour: DayColour.MORNING },
      { fraction: 0.38020833, colour: DayColour.WORK },
    ]);

    expect(gradient).toBe(
      "linear-gradient(to right, var(--color-day-night) 27.0833%, var(--color-day-morning) 31.25%, var(--color-day-work) 38.0208%)",
    );
  });

  it.each([
    [DayColour.NIGHT, "--color-day-night"],
    [DayColour.MORNING, "--color-day-morning"],
    [DayColour.WORK, "--color-day-work"],
    [DayColour.EVENING, "--color-day-evening"],
    [DayColour.PLAIN, "--color-accent"],
    [DayColour.WORKING_TIME, "--color-accent"],
    [DayColour.NON_WORKING_TIME, "--color-day-non-working"],
  ])("should map %s to %s", (colour, variable) => {
    expect(DAY_COLOUR_VARIABLES[colour]).toBe(variable);
  });

  it.each([
    [DayColour.NIGHT, "text-foreground"],
    [DayColour.MORNING, "text-hour-cell-foreground"],
    [DayColour.WORK, "text-hour-cell-foreground"],
    [DayColour.EVENING, "text-hour-cell-foreground"],
    [DayColour.PLAIN, "text-accent-foreground"],
    [DayColour.WORKING_TIME, "text-accent-foreground"],
    [DayColour.NON_WORKING_TIME, "text-foreground"],
  ])("should give the digits on %s the class %s", (colour, className) => {
    expect(DAY_COLOUR_FOREGROUND_CLASS_NAMES[colour]).toBe(className);
  });

  it("should write a single plain stop as two stops of its colour", () => {
    expect(
      buildDayTrackGradient([{ fraction: 0, colour: DayColour.PLAIN }]),
    ).toBe(
      "linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) 100%)",
    );
  });

  it("should write a single non-working stop as two stops of its colour", () => {
    expect(
      buildDayTrackGradient([
        { fraction: 0, colour: DayColour.NON_WORKING_TIME },
      ]),
    ).toBe(
      "linear-gradient(to right, var(--color-day-non-working) 0%, var(--color-day-non-working) 100%)",
    );
  });

  it.each<[string, DayColourStop[]]>([
    ["Plain", [{ fraction: 0, colour: DayColour.PLAIN }]],
    [
      "a Working hours track without an edge",
      [{ fraction: 0, colour: DayColour.NON_WORKING_TIME }],
    ],
    [
      "the Almaty Monday stops",
      [
        { fraction: 0.416667, colour: DayColour.NON_WORKING_TIME },
        { fraction: 0.416667, colour: DayColour.WORKING_TIME },
        { fraction: 0.75, colour: DayColour.WORKING_TIME },
        { fraction: 0.75, colour: DayColour.NON_WORKING_TIME },
      ],
    ],
    [
      "Time of day stops",
      [
        { fraction: 0.27, colour: DayColour.NIGHT },
        { fraction: 0.31, colour: DayColour.MORNING },
      ],
    ],
  ])("should give %s at least two colour stops", (_, stops) => {
    const colourStops = buildDayTrackGradient(stops).match(COLOUR_STOP_PATTERN);
    expect(colourStops?.length).toBeGreaterThanOrEqual(2);
  });

  it("should draw a hard working edge as two stops at one percentage", () => {
    const gradient = buildDayTrackGradient([
      { fraction: 0.5, colour: DayColour.NON_WORKING_TIME },
      { fraction: 0.5, colour: DayColour.WORKING_TIME },
    ]);
    expect(gradient).toBe(
      "linear-gradient(to right, var(--color-day-non-working) 50%, var(--color-accent) 50%)",
    );
  });

  it("should keep a position outside the track", () => {
    expect(formatPercent(-0.02)).toBe("-2%");
  });

  it("should give no gradient without stops", () => {
    expect(buildDayTrackGradient([])).toBe("none");
  });
});
