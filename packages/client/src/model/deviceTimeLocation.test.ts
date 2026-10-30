// Verifies FR8, FR9, FR12 of add-settings-page-and-device-time-location (D1, D3).
import { describe, expect, it } from "vitest";
import { DEVICE_TIME_LOCATION_ID } from "@/constants";
import { buildLocation } from "@/test/factories/buildLocation";
import {
  buildDeviceTimeLocation,
  buildFirstLaunchLocations,
  isDeviceTimeLocation,
  withDeviceTimeZone,
} from "./deviceTimeLocation";
import { LocationKind } from "./locationKind";
import { getLocationMarkKind, LocationMarkKind } from "./locationMark";
import {
  INITIAL_WORLD_CLOCK_STATE,
  type LocationCommand,
  LocationCommandType,
  LocationErrorCode,
  reduceLocations,
  type WorldClockState,
} from "./locations";
import { getReferenceZone } from "./referenceMoment";

const almatyDeviceState: WorldClockState = {
  ...INITIAL_WORLD_CLOCK_STATE,
  deviceTimeZoneId: "Asia/Almaty",
};

const reduceOk = (state: WorldClockState, command: LocationCommand) => {
  const outcome = reduceLocations(state, command);
  if (!outcome.ok) throw new Error(`unexpected error ${outcome.error}`);
  return outcome.state;
};

const withDeviceTime = (state = almatyDeviceState) =>
  reduceOk(state, { type: LocationCommandType.ADD_DEVICE_TIME_LOCATION });

describe("device time location", () => {
  it("should be built with the device zone and no label or country", () => {
    expect(buildDeviceTimeLocation("Asia/Almaty")).toEqual({
      id: DEVICE_TIME_LOCATION_ID,
      kind: LocationKind.DEVICE_TIME,
      timeZoneId: "Asia/Almaty",
      label: "",
      countryCode: "",
    });
  });

  it("should be recognized by its kind only", () => {
    expect(isDeviceTimeLocation(buildDeviceTimeLocation("UTC"))).toBe(true);
    expect(isDeviceTimeLocation(buildLocation())).toBe(false);
  });

  it("should be the only location of the first-launch list", () => {
    expect(buildFirstLaunchLocations("Asia/Almaty")).toEqual([
      buildDeviceTimeLocation("Asia/Almaty"),
    ]);
  });
});

describe("ADD_DEVICE_TIME_LOCATION", () => {
  it("should append the device time location at the end", () => {
    const state = reduceOk(almatyDeviceState, {
      type: LocationCommandType.ADD_LOCATION,
      timeZoneId: "Europe/Moscow",
      label: "Moscow",
      countryCode: "RU",
    });
    const added = withDeviceTime(state);
    expect(added.locations.map((location) => location.id)).toEqual([
      "Europe/Moscow|Moscow",
      DEVICE_TIME_LOCATION_ID,
    ]);
    expect(added.locations[1]?.timeZoneId).toBe("Asia/Almaty");
  });

  it("should fail with DUPLICATE_LOCATION for a second one", () => {
    expect(
      reduceLocations(withDeviceTime(), {
        type: LocationCommandType.ADD_DEVICE_TIME_LOCATION,
      }),
    ).toEqual({ ok: false, error: LocationErrorCode.DUPLICATE_LOCATION });
  });

  it("should not make a city in the device zone a duplicate", () => {
    const outcome = reduceLocations(withDeviceTime(), {
      type: LocationCommandType.ADD_LOCATION,
      timeZoneId: "Asia/Almaty",
      label: "Almaty",
      countryCode: "KZ",
    });
    expect(outcome.ok).toBe(true);
  });
});

describe("the device time location follows the device zone", () => {
  it("should take the new zone on SET_DEVICE_TIME_ZONE", () => {
    const moved = reduceOk(withDeviceTime(), {
      type: LocationCommandType.SET_DEVICE_TIME_ZONE,
      timeZoneId: "Asia/Tokyo",
    });
    expect(moved.locations[0]?.timeZoneId).toBe("Asia/Tokyo");
  });

  it("should take the canonical fallback zone for an unknown device zone", () => {
    const moved = reduceOk(withDeviceTime(), {
      type: LocationCommandType.SET_DEVICE_TIME_ZONE,
      timeZoneId: "Mars/Olympus_Mons",
    });
    expect(moved.locations[0]?.timeZoneId).toBe("UTC");
  });

  it("should take the device zone on REPLACE_LOCATIONS", () => {
    const replaced = reduceOk(almatyDeviceState, {
      type: LocationCommandType.REPLACE_LOCATIONS,
      locations: [buildDeviceTimeLocation("UTC")],
      homeLocationId: null,
    });
    expect(replaced.locations[0]?.timeZoneId).toBe("Asia/Almaty");
  });

  it("should keep the locations array when nothing changed", () => {
    const state = withDeviceTime();
    const again = reduceOk(state, {
      type: LocationCommandType.SET_DEVICE_TIME_ZONE,
      timeZoneId: "Asia/Almaty",
    });
    expect(again.locations).toBe(state.locations);
    expect(withDeviceTimeZone(state.locations, "Asia/Almaty")).toBe(
      state.locations,
    );
  });
});

describe("the device time location as an ordinary location", () => {
  it("should be removable, and clear home when removed", () => {
    const home = reduceOk(withDeviceTime(), {
      type: LocationCommandType.SET_HOME_LOCATION,
      id: DEVICE_TIME_LOCATION_ID,
    });
    const removed = reduceOk(home, {
      type: LocationCommandType.REMOVE_LOCATION,
      id: DEVICE_TIME_LOCATION_ID,
    });
    expect(removed.locations).toEqual([]);
    expect(removed.homeLocationId).toBeNull();
  });

  it("should be movable", () => {
    const withCity = reduceOk(withDeviceTime(), {
      type: LocationCommandType.ADD_LOCATION,
      timeZoneId: "Europe/Moscow",
      label: "Moscow",
      countryCode: "RU",
    });
    const moved = reduceOk(withCity, {
      type: LocationCommandType.MOVE_LOCATION,
      id: DEVICE_TIME_LOCATION_ID,
      targetIndex: 1,
    });
    expect(moved.locations.map((location) => location.id)).toEqual([
      "Europe/Moscow|Moscow",
      DEVICE_TIME_LOCATION_ID,
    ]);
  });

  it("should give the reference zone and the Home mark while home", () => {
    const home = reduceOk(withDeviceTime(), {
      type: LocationCommandType.SET_HOME_LOCATION,
      id: DEVICE_TIME_LOCATION_ID,
    });
    expect(getReferenceZone(home)).toBe("Asia/Almaty");
    expect(
      getLocationMarkKind(
        home.locations[0] ?? buildLocation(),
        home.deviceTimeZoneId,
        home.homeLocationId,
      ),
    ).toBe(LocationMarkKind.HOME);
  });

  it("should have the Here mark when it is not home", () => {
    const state = withDeviceTime();
    expect(
      getLocationMarkKind(
        state.locations[0] ?? buildLocation(),
        state.deviceTimeZoneId,
        null,
      ),
    ).toBe(LocationMarkKind.HERE);
  });
});
