// Verifies FR8, FR9 of set-home-location-and-show-differences (D6): migration to version 2.
import { STORAGE_KEYS } from "@/constants";
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

  it("should load a version 3 document as unreadable", () => {
    storeDocument({ schemaVersion: 3, payload: { locations: [] } });

    expect(createRepository().load()).toEqual({
      status: LocationsLoadStatus.UNREADABLE,
    });
  });
});
