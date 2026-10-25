// Verifies FR4 of add-time-sliders-to-location-cards (D7).
import { describe, expect, it } from "vitest";
import { TrackMove } from "@/controller";
import { getTrackMoveForKey } from "./dayTrackKeys";

describe("getTrackMoveForKey", () => {
  it.each([
    ["ArrowRight", TrackMove.NEXT_STEP],
    ["ArrowUp", TrackMove.NEXT_STEP],
    ["ArrowLeft", TrackMove.PREVIOUS_STEP],
    ["ArrowDown", TrackMove.PREVIOUS_STEP],
    ["PageUp", TrackMove.HOUR_FORWARD],
    ["PageDown", TrackMove.HOUR_BACK],
    ["Home", TrackMove.DAY_START],
    ["End", TrackMove.DAY_END],
    ["Tab", undefined],
    ["Enter", undefined],
  ])("should map %s to %s", (key, expected) => {
    expect(getTrackMoveForKey(key)).toBe(expected);
  });
});
