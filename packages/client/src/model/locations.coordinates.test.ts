// Verifies FR6, FR8, FR9 of add-city-coordinates-to-locations (D6, D7): coordinates of city locations.
import { describe, expect, it } from "vitest";
import { buildDeviceTimeLocation } from "./deviceTimeLocation";
import {
  INITIAL_WORLD_CLOCK_STATE,
  LocationCommandType,
  LocationErrorCode,
  LocationKind,
  reduceLocations,
  type WorldClockState,
} from "./locations";

const KAZAN_COORDINATES = { latitude: 55.8, longitude: 49.1 };
const MOSCOW_COORDINATES = { latitude: 55.8, longitude: 37.6 };
const kazan = {
  timeZoneId: "Europe/Moscow",
  label: "Kazan",
  countryCode: "RU",
};
const moscow = { ...kazan, label: "Moscow" };

const expectOk = (outcome: ReturnType<typeof reduceLocations>) => {
  if (!outcome.ok) throw new Error(`unexpected error ${outcome.error}`);
  return outcome.state;
};
const add = (
  state: WorldClockState,
  location: typeof kazan,
  coordinates?: unknown,
) =>
  reduceLocations(state, {
    type: LocationCommandType.ADD_LOCATION,
    ...location,
    ...(coordinates === undefined ? {} : { coordinates }),
  } as never);

describe("reduceLocations ADD_LOCATION coordinates", () => {
  // @add-city-coordinates-to-locations @FR6
  it("should hold the coordinates of the added city", () => {
    const state = expectOk(
      add(INITIAL_WORLD_CLOCK_STATE, kazan, KAZAN_COORDINATES),
    );
    expect(state.locations[0]?.coordinates).toEqual(KAZAN_COORDINATES);
  });

  it("should add a location without coordinates", () => {
    const state = expectOk(add(INITIAL_WORLD_CLOCK_STATE, kazan));
    expect(state.locations[0]).not.toHaveProperty("coordinates");
  });

  it.each([
    ["latitude 91", { latitude: 91, longitude: 0 }],
    ["text", { latitude: "1", longitude: 0 }],
  ])("should add the location without coordinates for %s", (_, coordinates) => {
    const state = expectOk(add(INITIAL_WORLD_CLOCK_STATE, kazan, coordinates));
    expect(state.locations[0]).not.toHaveProperty("coordinates");
  });

  it("should keep the id from zone and label whatever the coordinates", () => {
    const state = expectOk(
      add(INITIAL_WORLD_CLOCK_STATE, kazan, KAZAN_COORDINATES),
    );
    expect(state.locations[0]?.id).toBe("Europe/Moscow|Kazan");
  });

  // @add-city-coordinates-to-locations @FR6
  it("should reject a namesake of the same zone as a duplicate and keep the listed coordinates", () => {
    const first = expectOk(
      add(INITIAL_WORLD_CLOCK_STATE, kazan, KAZAN_COORDINATES),
    );
    const outcome = add(first, kazan, { latitude: 37.2, longitude: -93.3 });
    expect(outcome).toEqual({
      ok: false,
      error: LocationErrorCode.DUPLICATE_LOCATION,
    });
    expect(first.locations[0]?.coordinates).toEqual(KAZAN_COORDINATES);
  });
});

describe("the device time location", () => {
  it("should hold no coordinates", () => {
    const state = expectOk(
      reduceLocations(INITIAL_WORLD_CLOCK_STATE, {
        type: LocationCommandType.ADD_DEVICE_TIME_LOCATION,
      }),
    );
    expect(state.locations[0]).not.toHaveProperty("coordinates");
    expect(buildDeviceTimeLocation("Europe/Moscow")).not.toHaveProperty(
      "coordinates",
    );
  });
});

describe("reduceLocations FILL_LOCATION_COORDINATES", () => {
  const listed = expectOk(
    add(expectOk(add(INITIAL_WORLD_CLOCK_STATE, moscow)), kazan),
  );
  const fill = (state: WorldClockState, coordinatesByLocationId: unknown) =>
    reduceLocations(state, {
      type: LocationCommandType.FILL_LOCATION_COORDINATES,
      coordinatesByLocationId,
    } as never);

  // @add-city-coordinates-to-locations @FR8
  it("should fill the city locations without coordinates", () => {
    const state = expectOk(
      fill(listed, {
        "Europe/Moscow|Moscow": MOSCOW_COORDINATES,
        "Europe/Moscow|Kazan": KAZAN_COORDINATES,
      }),
    );
    expect(state.locations.map((location) => location.coordinates)).toEqual([
      MOSCOW_COORDINATES,
      KAZAN_COORDINATES,
    ]);
  });

  it("should keep order, home and identity", () => {
    const home = expectOk(
      reduceLocations(listed, {
        type: LocationCommandType.SET_HOME_LOCATION,
        id: "Europe/Moscow|Moscow",
      }),
    );
    const state = expectOk(
      fill(home, { "Europe/Moscow|Kazan": KAZAN_COORDINATES }),
    );
    expect(state.locations.map((location) => location.id)).toEqual([
      "Europe/Moscow|Moscow",
      "Europe/Moscow|Kazan",
    ]);
    expect(state.homeLocationId).toBe("Europe/Moscow|Moscow");
  });

  it("should return the same state when nothing changed", () => {
    expect(expectOk(fill(listed, {}))).toBe(listed);
  });

  it("should return the same state for an unknown location id", () => {
    expect(expectOk(fill(listed, { "Nowhere|X": KAZAN_COORDINATES }))).toBe(
      listed,
    );
  });

  it("should not overwrite coordinates a location holds", () => {
    const withCoordinates = expectOk(
      add(INITIAL_WORLD_CLOCK_STATE, kazan, KAZAN_COORDINATES),
    );
    const state = expectOk(
      fill(withCoordinates, { "Europe/Moscow|Kazan": MOSCOW_COORDINATES }),
    );
    expect(state).toBe(withCoordinates);
  });

  it("should ignore coordinates rejected by parseCoordinates", () => {
    expect(
      expectOk(
        fill(listed, { "Europe/Moscow|Kazan": { latitude: 91, longitude: 0 } }),
      ),
    ).toBe(listed);
  });

  it("should give the device time location nothing", () => {
    const withDevice = expectOk(
      reduceLocations(INITIAL_WORLD_CLOCK_STATE, {
        type: LocationCommandType.ADD_DEVICE_TIME_LOCATION,
      }),
    );
    const deviceLocation = withDevice.locations[0];
    expect(deviceLocation?.kind).toBe(LocationKind.DEVICE_TIME);
    expect(
      expectOk(
        fill(withDevice, { [deviceLocation?.id as string]: KAZAN_COORDINATES }),
      ),
    ).toBe(withDevice);
  });
});
