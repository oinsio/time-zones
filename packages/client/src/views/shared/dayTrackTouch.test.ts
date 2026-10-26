// Verifies FR3, NFR-R2 of add-time-sliders-to-location-cards (D7).
import { describe, expect, it } from "vitest";
import { getTouchGestureDecision, TouchGestureDecision } from "./dayTrackTouch";

const START = { x: 100, y: 100 };

describe("getTouchGestureDecision", () => {
  it.each([
    ["no movement", { x: 100, y: 100 }, TouchGestureDecision.WAIT],
    ["11 px right, 2 px down", { x: 111, y: 102 }, TouchGestureDecision.SELECT],
    ["11 px left", { x: 89, y: 100 }, TouchGestureDecision.SELECT],
    [
      "2 px right, 11 px down",
      { x: 102, y: 111 },
      TouchGestureDecision.ABANDON,
    ],
    ["10 px right", { x: 110, y: 100 }, TouchGestureDecision.WAIT],
    ["12 px right, 12 px up", { x: 112, y: 88 }, TouchGestureDecision.ABANDON],
    ["5 px right", { x: 105, y: 100 }, TouchGestureDecision.WAIT],
    ["10 px down", { x: 100, y: 110 }, TouchGestureDecision.WAIT],
    [
      "20 px right, 11 px down",
      { x: 120, y: 111 },
      TouchGestureDecision.SELECT,
    ],
  ])("should decide %s", (_name, current, expected) => {
    expect(getTouchGestureDecision(START, current)).toBe(expected);
  });
});
