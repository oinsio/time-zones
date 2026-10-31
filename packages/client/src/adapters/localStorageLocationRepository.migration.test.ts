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

describe("local storage location repository migration to version 2", () => {
  const v1Locations = [
    { timeZoneId: "Asia/Almaty", label: "Almaty", countryCode: "KZ" },
    { timeZoneId: "Europe/Moscow", label: "Moscow", countryCode: "RU" },
    { timeZoneId: "Asia/Calcutta", label: "Kolkata", countryCode: "IN" },
  ];

  it("should load a version 1 list in order with no home", () => {
    storeDocument({ schemaVersion: 1, payload: { locations: v1Locations } });

    const result = createRepository().load();

    expect(result).toMatchObject({
      status: LocationsLoadStatus.LOADED,
      homeLocationId: null,
    });
    expect(
      result.status === LocationsLoadStatus.LOADED &&
        result.locations.map((location) => location.id),
    ).toEqual([
      "device-time",
      "Asia/Almaty|Almaty",
      "Europe/Moscow|Moscow",
      "Asia/Kolkata|Kolkata",
    ]);
  });

  it("should write nothing when a version 1 list is loaded", () => {
    const rawDocument = JSON.stringify({
      schemaVersion: 1,
      payload: { locations: v1Locations },
    });
    storeDocument(rawDocument);

    createRepository().load();

    expect(localStorage.getItem(STORAGE_KEYS.LOCATIONS)).toBe(rawDocument);
  });

  it("should clear a home that is missing from its list on load", () => {
    storeDocument({
      schemaVersion: 2,
      payload: { locations: v1Locations, homeLocationId: "Asia/Tokyo|Tokyo" },
    });

    expect(createRepository().load()).toMatchObject({
      status: LocationsLoadStatus.LOADED,
      homeLocationId: null,
    });
  });

  it("should keep a listed home on load", () => {
    storeDocument({
      schemaVersion: 2,
      payload: { locations: v1Locations, homeLocationId: "Asia/Almaty|Almaty" },
    });

    expect(createRepository().load()).toMatchObject({
      homeLocationId: "Asia/Almaty|Almaty",
    });
  });

  it("should load a version 4 document as unreadable", () => {
    storeDocument({ schemaVersion: 4, payload: { locations: [] } });

    expect(createRepository().load()).toEqual({
      status: LocationsLoadStatus.UNREADABLE,
    });
  });
});

// Verifies FR12, FR13, FR14 of add-settings-page-and-device-time-location (D2).
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
