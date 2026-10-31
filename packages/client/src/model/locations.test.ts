// FR8, FR9, FR10 of add-locations-via-search and FR2 of reorder-locations-by-drag-and-drop: locations reducer (D1).
// FR3, FR4 of mark-device-time-zone-in-location-list: device zone in the state.
import { describe, expect, it } from "vitest";
import {
  INITIAL_WORLD_CLOCK_STATE,
  LocationCommandType,
  LocationErrorCode,
  LocationKind,
  reduceLocations,
  type WorldClockState,
} from "./locations";
import { ReferenceMode } from "./referenceMoment";

const emptyState: WorldClockState = INITIAL_WORLD_CLOCK_STATE;
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

const add = (state: WorldClockState, location: typeof moscow) =>
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
      { id: "Europe/Moscow|Moscow", kind: LocationKind.CITY, ...moscow },
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
  const remove = (state: WorldClockState, id: string) =>
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
    const locations = [
      { id: "Asia/Almaty|Almaty", kind: LocationKind.CITY, ...almaty },
    ];
    const state = expectOk(
      reduceLocations(emptyState, {
        type: LocationCommandType.REPLACE_LOCATIONS,
        homeLocationId: null,
        locations,
      }),
    );
    expect(state.locations).toEqual(locations);
  });
});

describe("reduceLocations MOVE_LOCATION", () => {
  const twoLocations = expectOk(add(expectOk(add(emptyState, moscow)), almaty));

  it("should apply the move to the list", () => {
    const state = expectOk(
      reduceLocations(twoLocations, {
        type: LocationCommandType.MOVE_LOCATION,
        id: "Asia/Almaty|Almaty",
        targetIndex: 0,
      }),
    );
    expect(state.locations.map((location) => location.label)).toEqual([
      "Almaty",
      "Moscow",
    ]);
  });

  it("should return LOCATION_NOT_FOUND for an unknown id", () => {
    expect(
      reduceLocations(twoLocations, {
        type: LocationCommandType.MOVE_LOCATION,
        id: "none",
        targetIndex: 0,
      }),
    ).toEqual({ ok: false, error: LocationErrorCode.LOCATION_NOT_FOUND });
  });

  it("should return LOCATION_POSITION_OUT_OF_RANGE for a bad index", () => {
    expect(
      reduceLocations(twoLocations, {
        type: LocationCommandType.MOVE_LOCATION,
        id: "Asia/Almaty|Almaty",
        targetIndex: 2,
      }),
    ).toEqual({
      ok: false,
      error: LocationErrorCode.LOCATION_POSITION_OUT_OF_RANGE,
    });
  });
});

describe("INITIAL_WORLD_CLOCK_STATE", () => {
  it("should start without locations and with the UTC device zone", () => {
    expect(INITIAL_WORLD_CLOCK_STATE).toEqual({
      locations: [],
      deviceTimeZoneId: "UTC",
      homeLocationId: null,
      reference: { mode: ReferenceMode.LIVE },
    });
  });
});

describe("reduceLocations SET_DEVICE_TIME_ZONE", () => {
  const setDeviceZone = (state: WorldClockState, timeZoneId: string) =>
    reduceLocations(state, {
      type: LocationCommandType.SET_DEVICE_TIME_ZONE,
      timeZoneId,
    });

  it.each([
    ["Asia/Almaty", "Asia/Almaty"],
    ["Asia/Calcutta", "Asia/Kolkata"],
    ["Mars/Olympus_Mons", "UTC"],
    ["+05:00", "UTC"],
  ])("should store %s as %s", (input, expected) => {
    const state = expectOk(setDeviceZone(emptyState, input));
    expect(state.deviceTimeZoneId).toBe(expected);
  });

  it("should return the very same state for the same zone", () => {
    const state = expectOk(setDeviceZone(emptyState, "Asia/Almaty"));
    expect(expectOk(setDeviceZone(state, "Asia/Almaty"))).toBe(state);
  });

  it("should keep the device zone on add, remove and replace", () => {
    const withZone = expectOk(setDeviceZone(emptyState, "Asia/Almaty"));
    const added = expectOk(add(withZone, moscow));
    const removed = expectOk(
      reduceLocations(added, {
        type: LocationCommandType.REMOVE_LOCATION,
        id: "Europe/Moscow|Moscow",
      }),
    );
    const replaced = expectOk(
      reduceLocations(added, {
        type: LocationCommandType.REPLACE_LOCATIONS,
        locations: [],
        homeLocationId: null,
      }),
    );
    expect(
      [added, removed, replaced].map((state) => state.deviceTimeZoneId),
    ).toEqual(["Asia/Almaty", "Asia/Almaty", "Asia/Almaty"]);
  });
});
