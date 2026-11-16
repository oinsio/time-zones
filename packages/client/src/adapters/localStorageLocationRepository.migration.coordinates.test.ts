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

describe("local storage location repository migration to version 4", () => {
  const MOSCOW_ID = "Europe/Moscow|Moscow";
  const version3Document = {
    schemaVersion: 3,
    payload: {
      locations: [
        { kind: "DEVICE_TIME" },
        {
          kind: "CITY",
          timeZoneId: "Europe/Moscow",
          label: "Moscow",
          countryCode: "RU",
        },
        {
          kind: "CITY",
          timeZoneId: "Asia/Almaty",
          label: "Almaty",
          countryCode: "KZ",
        },
      ],
      homeLocationId: MOSCOW_ID,
    },
  };

  // @add-city-coordinates-to-locations @FR7
  it("should read a version 3 list as the same locations, order and home without coordinates", () => {
    storeDocument(version3Document);

    const result = createRepository().load();

    expect(result).toMatchObject({
      status: LocationsLoadStatus.LOADED,
      homeLocationId: MOSCOW_ID,
    });
    if (result.status !== LocationsLoadStatus.LOADED) {
      throw new Error("the version 3 list should load");
    }
    expect(
      result.locations.map((location) => [location.id, location.coordinates]),
    ).toEqual([
      ["device-time", undefined],
      [MOSCOW_ID, undefined],
      ["Asia/Almaty|Almaty", undefined],
    ]);
  });

  // @add-city-coordinates-to-locations @FR7
  it("should write nothing when a version 3 list is loaded", () => {
    storeDocument(version3Document);
    const stored = localStorage.getItem(STORAGE_KEYS.LOCATIONS);

    createRepository().load();

    expect(localStorage.getItem(STORAGE_KEYS.LOCATIONS)).toBe(stored);
  });

  it("should write version 4", () => {
    createRepository().save({ locations: [], homeLocationId: null });

    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS) ?? "")
        .schemaVersion,
    ).toBe(4);
  });
});
