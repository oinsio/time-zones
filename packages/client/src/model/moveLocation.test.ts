// FR2, M2 of reorder-locations-by-drag-and-drop: move a location in the list.
import { describe, expect, it } from "vitest";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { LocationErrorCode, type LocationsState } from "./locations";
import { moveLocationInList } from "./moveLocation";

const buildCity = (label: string) =>
  buildLocation({ label, ...KNOWN_CITIES[label] });

const state: LocationsState = {
  locations: ["Almaty", "Moscow", "Kolkata", "Tokyo"].map(buildCity),
};

const labelsOf = (outcome: ReturnType<typeof moveLocationInList>) => {
  if (!outcome.ok) throw new Error(`unexpected error ${outcome.error}`);
  return outcome.state.locations.map((location) => location.label);
};

describe("moveLocationInList", () => {
  it.each([
    ["Almaty", 3, ["Moscow", "Kolkata", "Tokyo", "Almaty"]],
    ["Tokyo", 0, ["Tokyo", "Almaty", "Moscow", "Kolkata"]],
    ["Moscow", 2, ["Almaty", "Kolkata", "Moscow", "Tokyo"]],
    ["Kolkata", 1, ["Almaty", "Kolkata", "Moscow", "Tokyo"]],
  ])("should move %s to index %i", (label, targetIndex, expectedLabels) => {
    const id = buildCity(label).id;
    expect(labelsOf(moveLocationInList(state, id, targetIndex))).toEqual(
      expectedLabels,
    );
  });

  it("should return the same state object when the index is the current one", () => {
    const outcome = moveLocationInList(state, buildCity("Moscow").id, 1);
    expect(outcome).toEqual({ ok: true, state });
    expect(outcome.ok && outcome.state).toBe(state);
  });

  it.each([-1, 4, 1.5])(
    "should reject the index %s as out of range",
    (targetIndex) => {
      expect(
        moveLocationInList(state, buildCity("Moscow").id, targetIndex),
      ).toEqual({
        ok: false,
        error: LocationErrorCode.LOCATION_POSITION_OUT_OF_RANGE,
      });
    },
  );

  it("should report an unknown id as not found", () => {
    expect(moveLocationInList(state, "Nowhere|Nowhere", 0)).toEqual({
      ok: false,
      error: LocationErrorCode.LOCATION_NOT_FOUND,
    });
  });

  it("should keep every field of the moved entries", () => {
    const outcome = moveLocationInList(state, buildCity("Tokyo").id, 0);
    expect(outcome.ok && outcome.state.locations[0]).toEqual(
      buildCity("Tokyo"),
    );
  });

  it("should not mutate the original list", () => {
    moveLocationInList(state, buildCity("Tokyo").id, 0);
    expect(state.locations.map((location) => location.label)).toEqual([
      "Almaty",
      "Moscow",
      "Kolkata",
      "Tokyo",
    ]);
  });
});
