// Verifies FR1, FR2, FR3, FR10 of set-home-location-and-show-differences: home location in the state (D1).
import { describe, expect, it } from "vitest";
import { LocationKind } from "./locationKind";
import {
  canonicalizeLocationId,
  INITIAL_WORLD_CLOCK_STATE,
  type Location,
  type LocationCommand,
  LocationCommandType,
  LocationErrorCode,
  reduceLocations,
  type WorldClockState,
} from "./locations";

const moscow: Location = {
  id: "Europe/Moscow|Moscow",
  kind: LocationKind.CITY,
  timeZoneId: "Europe/Moscow",
  label: "Moscow",
  countryCode: "RU",
};
const almaty: Location = {
  id: "Asia/Almaty|Almaty",
  kind: LocationKind.CITY,
  timeZoneId: "Asia/Almaty",
  label: "Almaty",
  countryCode: "KZ",
};
const listState: WorldClockState = {
  ...INITIAL_WORLD_CLOCK_STATE,
  locations: [moscow, almaty],
};
const homeState: WorldClockState = { ...listState, homeLocationId: almaty.id };

const reduceOk = (state: WorldClockState, command: LocationCommand) => {
  const outcome = reduceLocations(state, command);
  if (!outcome.ok) throw new Error(`unexpected error ${outcome.error}`);
  return outcome.state;
};
const setHome = (id: string | null): LocationCommand => ({
  type: LocationCommandType.SET_HOME_LOCATION,
  id,
});

describe("SET_HOME_LOCATION", () => {
  it("should start without a home location", () => {
    expect(INITIAL_WORLD_CLOCK_STATE.homeLocationId).toBeNull();
  });

  it("should set the home location", () => {
    expect(reduceOk(listState, setHome(almaty.id)).homeLocationId).toBe(
      almaty.id,
    );
  });

  it("should move home to another location", () => {
    expect(reduceOk(homeState, setHome(moscow.id)).homeLocationId).toBe(
      moscow.id,
    );
  });

  it("should return the same state when home is set again", () => {
    expect(reduceOk(homeState, setHome(almaty.id))).toBe(homeState);
  });

  it("should clear the home location", () => {
    expect(reduceOk(homeState, setHome(null)).homeLocationId).toBeNull();
  });

  it("should return the same state when clearing without a home", () => {
    expect(reduceOk(listState, setHome(null))).toBe(listState);
  });

  it("should reject an id that is not in the list", () => {
    expect(reduceLocations(listState, setHome("Asia/Tokyo|Tokyo"))).toEqual({
      ok: false,
      error: LocationErrorCode.LOCATION_NOT_FOUND,
    });
  });

  it("should reject a location whose zone is unknown", () => {
    const unknownZone: Location = {
      ...moscow,
      id: "Mars/Base|Base",
      kind: LocationKind.CITY,
      timeZoneId: "Mars/Base",
    };
    const state = { ...listState, locations: [unknownZone] };
    expect(reduceLocations(state, setHome(unknownZone.id))).toEqual({
      ok: false,
      error: LocationErrorCode.LOCATION_NOT_FOUND,
    });
  });

  it("should survive a JSON round trip as a command", () => {
    const command = setHome(almaty.id);
    expect(JSON.parse(JSON.stringify(command))).toEqual(command);
  });
});

describe("home location and the other commands", () => {
  it("should clear home when the home location is removed", () => {
    const state = reduceOk(homeState, {
      type: LocationCommandType.REMOVE_LOCATION,
      id: almaty.id,
    });
    expect(state.homeLocationId).toBeNull();
  });

  it("should keep home when another location is removed", () => {
    const state = reduceOk(homeState, {
      type: LocationCommandType.REMOVE_LOCATION,
      id: moscow.id,
    });
    expect(state.homeLocationId).toBe(almaty.id);
  });

  it("should keep home when a location is added", () => {
    const state = reduceOk(homeState, {
      type: LocationCommandType.ADD_LOCATION,
      timeZoneId: "Asia/Tokyo",
      label: "Tokyo",
      countryCode: "JP",
    });
    expect(state.homeLocationId).toBe(almaty.id);
  });

  it("should keep home in place when a location is moved", () => {
    const state = reduceOk(homeState, {
      type: LocationCommandType.MOVE_LOCATION,
      id: almaty.id,
      targetIndex: 0,
    });
    expect(state.locations[0]?.id).toBe(almaty.id);
    expect(state.homeLocationId).toBe(almaty.id);
  });

  it("should replace the list together with home", () => {
    const state = reduceOk(listState, {
      type: LocationCommandType.REPLACE_LOCATIONS,
      locations: [moscow, almaty],
      homeLocationId: moscow.id,
    });
    expect(state.homeLocationId).toBe(moscow.id);
  });

  it("should drop a replaced home that is not in the list", () => {
    const state = reduceOk(homeState, {
      type: LocationCommandType.REPLACE_LOCATIONS,
      locations: [moscow],
      homeLocationId: almaty.id,
    });
    expect(state.homeLocationId).toBeNull();
  });
});

describe("canonicalizeLocationId", () => {
  it("should rebuild the id with the canonical zone", () => {
    expect(canonicalizeLocationId("Europe/Kiev|Kyiv")).toBe("Europe/Kyiv|Kyiv");
  });

  it("should keep a label that contains the separator", () => {
    expect(canonicalizeLocationId("Europe/Kyiv|A|B")).toBe("Europe/Kyiv|A|B");
  });

  it.each(["Mars/Base|Base", "no-separator"])(
    "should return undefined for %s",
    (id) => {
      expect(canonicalizeLocationId(id)).toBeUndefined();
    },
  );
});
