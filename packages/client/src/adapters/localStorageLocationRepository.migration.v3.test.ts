// Verifies FR8, FR9 of set-home-location-and-show-differences (D6): migration to version 2.
import { STORAGE_KEYS } from "@/constants";
import { buildDeviceTimeLocation } from "@/model";
import { LocationsLoadStatus } from "@/ports";
import {
  createRepository,
  storeDocument,
} from "@/test/localStorageRepositoryHelpers";

beforeEach(() => {
  localStorage.clear();
});

describe("local storage location repository migration to version 3", () => {
  const moscowAndNewYork = [
    { timeZoneId: "Europe/Moscow", label: "Moscow", countryCode: "RU" },
    { timeZoneId: "America/New_York", label: "New York", countryCode: "US" },
  ];
  const idsOf = (
    result: ReturnType<ReturnType<typeof createRepository>["load"]>,
  ) =>
    result.status === LocationsLoadStatus.LOADED
      ? result.locations.map((location) => location.id)
      : [];

  it("should list the device time location first in a version 2 document and keep home", () => {
    storeDocument({
      schemaVersion: 2,
      payload: {
        locations: moscowAndNewYork,
        homeLocationId: "Europe/Moscow|Moscow",
      },
    });

    const result = createRepository().load();

    expect(idsOf(result)).toEqual([
      "device-time",
      "Europe/Moscow|Moscow",
      "America/New_York|New York",
    ]);
    expect(result).toMatchObject({ homeLocationId: "Europe/Moscow|Moscow" });
  });

  it("should write nothing when a version 2 document is loaded", () => {
    const rawDocument = JSON.stringify({
      schemaVersion: 2,
      payload: { locations: moscowAndNewYork, homeLocationId: null },
    });
    storeDocument(rawDocument);

    createRepository().load();

    expect(localStorage.getItem(STORAGE_KEYS.LOCATIONS)).toBe(rawDocument);
  });

  it("should give a version 1 document the device time location first and no home", () => {
    storeDocument({
      schemaVersion: 1,
      payload: { locations: moscowAndNewYork },
    });

    const result = createRepository().load();

    expect(idsOf(result)[0]).toBe("device-time");
    expect(result).toMatchObject({ homeLocationId: null });
  });

  it("should load a version 3 empty list as empty", () => {
    storeDocument({
      schemaVersion: 3,
      payload: { locations: [], homeLocationId: null },
    });

    expect(createRepository().load()).toEqual({
      status: LocationsLoadStatus.LOADED,
      locations: [],
      homeLocationId: null,
    });
  });

  it("should load a version 3 device time location as home", () => {
    storeDocument({
      schemaVersion: 3,
      payload: {
        locations: [{ kind: "DEVICE_TIME" }],
        homeLocationId: "device-time",
      },
    });

    expect(createRepository().load()).toMatchObject({
      status: LocationsLoadStatus.LOADED,
      homeLocationId: "device-time",
    });
  });

  it.each([
    [
      "a second device time location",
      [{ kind: "DEVICE_TIME" }, { kind: "DEVICE_TIME" }],
    ],
    ["an unknown kind", [{ kind: "PLANET", ...moscowAndNewYork[0] }]],
    [
      "a device time location with a zone",
      [{ kind: "DEVICE_TIME", timeZoneId: "Asia/Almaty" }],
    ],
  ])("should reject %s as unreadable", (_name, locations) => {
    storeDocument({
      schemaVersion: 3,
      payload: { locations, homeLocationId: null },
    });

    expect(createRepository().load()).toEqual({
      status: LocationsLoadStatus.UNREADABLE,
    });
  });

  it("should write the device time location as a kind without a zone", () => {
    createRepository().save({
      locations: [buildDeviceTimeLocation("Asia/Almaty")],
      homeLocationId: "device-time",
    });

    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS) ?? "").payload,
    ).toEqual({
      locations: [{ kind: "DEVICE_TIME" }],
      homeLocationId: "device-time",
    });
  });
});

// Verifies FR7, FR9 of add-city-coordinates-to-locations (D6): migration to version 4.
