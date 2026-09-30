// FR8, FR9, FR10 of add-locations-via-search: locations reducer (D1).
import { describe, expect, it } from "vitest";
import {
  LocationCommandType,
  LocationErrorCode,
  type LocationsState,
  reduceLocations,
} from "./locations";

const emptyState: LocationsState = { locations: [] };
const moscow = {
  timeZoneId: "Europe/Moscow",
  label: "Moscow",
  countryCode: "RU",
};
const almaty = {
  timeZoneId: "Asia/Almaty",
  label: "Almaty",
  countryCode: "KZ",
};

const add = (state: LocationsState, location: typeof moscow) =>
  reduceLocations(state, {
    type: LocationCommandType.ADD_LOCATION,
    ...location,
  });

const expectOk = (outcome: ReturnType<typeof reduceLocations>) => {
  if (!outcome.ok) throw new Error(`unexpected error ${outcome.error}`);
  return outcome.state;
};

describe("reduceLocations ADD_LOCATION", () => {
  it("should append the location with an id derived from zone and label", () => {
    const state = expectOk(add(emptyState, moscow));
    expect(state.locations).toEqual([
      { id: "Europe/Moscow|Moscow", ...moscow },
    ]);
  });

  it("should keep the order of existing locations and append at the end", () => {
    const state = expectOk(add(expectOk(add(emptyState, almaty)), moscow));
    expect(state.locations.map((location) => location.label)).toEqual([
      "Almaty",
      "Moscow",
    ]);
  });

  it("should canonicalize a legacy identifier", () => {
    const state = expectOk(
      add(emptyState, { ...almaty, timeZoneId: "Asia/Calcutta" }),
    );
    expect(state.locations[0]?.timeZoneId).toBe("Asia/Kolkata");
  });

  it("should reject a duplicate by canonical identifier and label", () => {
    const kyiv = {
      timeZoneId: "Europe/Kyiv",
      label: "Kyiv",
      countryCode: "UA",
    };
    const state = expectOk(add(emptyState, kyiv));
    const outcome = add(state, { ...kyiv, timeZoneId: "Europe/Kiev" });
    expect(outcome).toEqual({
      ok: false,
      error: LocationErrorCode.DUPLICATE_LOCATION,
    });
  });

  it("should allow the same zone under another label", () => {
    const state = expectOk(add(emptyState, moscow));
    expect(add(state, { ...moscow, label: "Москва" }).ok).toBe(true);
  });

  it.each(["+05:00", "Mars/Olympus_Mons"])(
    "should reject %s as an unknown time zone",
    (timeZoneId) => {
      expect(add(emptyState, { ...moscow, timeZoneId })).toEqual({
        ok: false,
        error: LocationErrorCode.UNKNOWN_TIME_ZONE,
      });
    },
  );
});

describe("reduceLocations REMOVE_LOCATION", () => {
  const remove = (state: LocationsState, id: string) =>
    reduceLocations(state, { type: LocationCommandType.REMOVE_LOCATION, id });

  it("should remove from the middle and keep the order", () => {
    const kolkata = {
      timeZoneId: "Asia/Kolkata",
      label: "Kolkata",
      countryCode: "IN",
    };
    const state = expectOk(
      add(expectOk(add(expectOk(add(emptyState, almaty)), moscow)), kolkata),
    );
    const next = expectOk(remove(state, "Europe/Moscow|Moscow"));
    expect(next.locations.map((location) => location.label)).toEqual([
      "Almaty",
      "Kolkata",
    ]);
  });

  it("should leave an empty list after the last removal", () => {
    const state = expectOk(add(emptyState, moscow));
    expect(expectOk(remove(state, "Europe/Moscow|Moscow")).locations).toEqual(
      [],
    );
  });

  it("should report an id missing from a non-empty list as location not found", () => {
    const state = expectOk(add(emptyState, almaty));
    expect(remove(state, "Europe/Moscow|Moscow")).toEqual({
      ok: false,
      error: LocationErrorCode.LOCATION_NOT_FOUND,
    });
  });

  it("should report a missing id as location not found", () => {
    expect(remove(emptyState, "Europe/Moscow|Moscow")).toEqual({
      ok: false,
      error: LocationErrorCode.LOCATION_NOT_FOUND,
    });
  });
});

describe("reduceLocations REPLACE_LOCATIONS", () => {
  it("should replace the whole list", () => {
    const locations = [{ id: "Asia/Almaty|Almaty", ...almaty }];
    const state = expectOk(
      reduceLocations(emptyState, {
        type: LocationCommandType.REPLACE_LOCATIONS,
        locations,
      }),
    );
    expect(state.locations).toEqual(locations);
  });
});
