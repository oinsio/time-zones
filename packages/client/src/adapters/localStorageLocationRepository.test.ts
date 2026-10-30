// Verifies FR9, FR11 (document) of add-locations-via-search (D4).
// Verifies FR8 of set-home-location-and-show-differences (D6): home in the document.
import { LOCATIONS_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
import { LocationKind } from "@/model";
import { LocationsLoadStatus } from "@/ports";
import { createInMemoryChannelHub } from "@/test/inMemoryChannel";
import {
  createRepository,
  moscow,
  storeDocument,
  useBrowserStorage,
} from "@/test/localStorageRepositoryHelpers";
import { createLocalStorageLocationRepository } from "./localStorageLocationRepository";
import { describeLocationRepositoryContract } from "./locationRepository.contract";

beforeEach(() => {
  localStorage.clear();
});

describeLocationRepositoryContract("local storage", {
  createPair: () => {
    localStorage.clear();
    const hub = createInMemoryChannelHub();
    const options = {
      getStorage: useBrowserStorage,
      createChannel: hub.createChannel,
    };
    return {
      first: createLocalStorageLocationRepository(options),
      second: createLocalStorageLocationRepository(options),
    };
  },
});

describe("local storage location repository document", () => {
  it("should store a versioned envelope without derived ids", () => {
    createRepository().save({ locations: [moscow], homeLocationId: null });
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS) ?? ""),
    ).toEqual({
      schemaVersion: LOCATIONS_SCHEMA_VERSION,
      payload: {
        locations: [
          {
            kind: "CITY",
            timeZoneId: "Europe/Moscow",
            label: "Moscow",
            countryCode: "RU",
          },
        ],
        homeLocationId: null,
      },
    });
  });

  it("should store the id of the home location in the payload", () => {
    createRepository().save({ locations: [moscow], homeLocationId: moscow.id });
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS) ?? "").payload
        .homeLocationId,
    ).toBe(moscow.id);
  });

  it("should remove the stored document on clear", () => {
    const repository = createRepository();
    repository.save({ locations: [moscow], homeLocationId: null });
    repository.clear();
    expect(localStorage.getItem(STORAGE_KEYS.LOCATIONS)).toBeNull();
  });

  it.each([
    ["not JSON", "{oops"],
    [
      "a newer schema version",
      {
        schemaVersion: LOCATIONS_SCHEMA_VERSION + 1,
        payload: { locations: [] },
      },
    ],
    ["schema version zero", { schemaVersion: 0, payload: { locations: [] } }],
    [
      "a fractional schema version",
      { schemaVersion: 0.5, payload: { locations: [] } },
    ],
    ["a missing schema version", { payload: { locations: [] } }],
    ["a JSON null", "null"],
    [
      "an offset identifier",
      {
        schemaVersion: 1,
        payload: {
          locations: [{ timeZoneId: "+05:00", label: "X", countryCode: "" }],
        },
      },
    ],
    ["a wrong payload shape", { schemaVersion: 1, payload: { places: [] } }],
  ])("should load %s as unreadable", (_description, document) => {
    storeDocument(document);
    expect(createRepository().load()).toEqual({
      status: LocationsLoadStatus.UNREADABLE,
    });
  });

  it("should load a legacy identifier as canonical", () => {
    storeDocument({
      schemaVersion: 1,
      payload: {
        locations: [
          { timeZoneId: "Asia/Calcutta", label: "Kolkata", countryCode: "IN" },
        ],
      },
    });
    expect(createRepository().load()).toMatchObject({
      status: LocationsLoadStatus.LOADED,
      locations: [
        { kind: LocationKind.DEVICE_TIME },
        { timeZoneId: "Asia/Kolkata" },
      ],
      homeLocationId: null,
    });
  });

  it("should migrate an older document step by step", () => {
    storeDocument({ schemaVersion: 1, payload: { legacy: true } });
    const repository = createLocalStorageLocationRepository({
      getStorage: useBrowserStorage,
      createChannel: () => undefined,
      schemaVersion: 2,
      migrations: { 1: () => ({ locations: [] }) },
    });
    expect(repository.load()).toEqual({
      status: LocationsLoadStatus.LOADED,
      locations: [],
      homeLocationId: null,
    });
  });

  it("should load an older document without a migration as unreadable", () => {
    storeDocument({ schemaVersion: 1, payload: { locations: [] } });
    const repository = createLocalStorageLocationRepository({
      getStorage: useBrowserStorage,
      createChannel: () => undefined,
      schemaVersion: 2,
      migrations: {},
    });
    expect(repository.load()).toEqual({
      status: LocationsLoadStatus.UNREADABLE,
    });
  });
});
