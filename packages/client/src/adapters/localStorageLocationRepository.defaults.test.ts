// Verifies FR11, FR13 (persistence request, defaults) of add-locations-via-search (D4).
// Verifies FR8, FR9 of set-home-location-and-show-differences (D6): migration to version 2.
import { LOCATIONS_SYNC_CHANNEL_NAME, STORAGE_KEYS } from "@/constants";
import { LocationsLoadStatus, SaveOutcome } from "@/ports";
import {
  createRepository,
  moscow,
  storeDocument,
  useBrowserStorage,
} from "@/test/localStorageRepositoryHelpers";
import {
  createLocalStorageLocationRepository,
  localStorageLocationRepository,
} from "./localStorageLocationRepository";

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

describe("local storage location repository persistence request", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should request persistent storage once after the first save", () => {
    const persist = vi.fn().mockResolvedValue(true);
    vi.stubGlobal("navigator", { storage: { persist } });
    const repository = createRepository();
    repository.save({ locations: [moscow], homeLocationId: null });
    repository.save({ locations: [], homeLocationId: null });
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it("should not request persistent storage when the save failed", () => {
    const persist = vi.fn().mockResolvedValue(true);
    vi.stubGlobal("navigator", { storage: { persist } });
    createLocalStorageLocationRepository({
      getStorage: () => {
        throw new Error("blocked");
      },
      createChannel: () => undefined,
    }).save({ locations: [moscow], homeLocationId: null });
    expect(persist).not.toHaveBeenCalled();
  });

  it("should save when the browser has no storage manager", () => {
    vi.stubGlobal("navigator", {});
    expect(
      createRepository().save({ locations: [moscow], homeLocationId: null }),
    ).toBe(SaveOutcome.SAVED);
  });

  it("should save when persist rejects", () => {
    vi.stubGlobal("navigator", {
      storage: { persist: () => Promise.reject(new Error("denied")) },
    });
    expect(
      createRepository().save({ locations: [moscow], homeLocationId: null }),
    ).toBe(SaveOutcome.SAVED);
  });
});

describe("local storage location repository defaults", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should use the browser localStorage for the exported repository", () => {
    localStorageLocationRepository.save({
      locations: [moscow],
      homeLocationId: null,
    });
    expect(localStorage.getItem(STORAGE_KEYS.LOCATIONS)).not.toBeNull();
  });

  it("should sync over a BroadcastChannel named after the constant", () => {
    const names: string[] = [];
    const postMessage = vi.fn();
    vi.stubGlobal(
      "BroadcastChannel",
      class {
        constructor(name: string) {
          names.push(name);
        }
        postMessage = postMessage;
        addEventListener() {}
        removeEventListener() {}
      },
    );
    createLocalStorageLocationRepository({
      getStorage: useBrowserStorage,
    }).save({ locations: [moscow], homeLocationId: null });
    expect(names).toEqual([LOCATIONS_SYNC_CHANNEL_NAME]);
    expect(postMessage).toHaveBeenCalledTimes(1);
  });

  it("should listen to storage events when BroadcastChannel is undefined", () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    const listener = vi.fn();
    createLocalStorageLocationRepository({
      getStorage: useBrowserStorage,
    }).subscribe(listener);
    globalThis.dispatchEvent(
      new StorageEvent("storage", { key: STORAGE_KEYS.LOCATIONS }),
    );
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should listen to the message event of the channel", () => {
    const addEventListener = vi.fn();
    createLocalStorageLocationRepository({
      getStorage: useBrowserStorage,
      createChannel: () => ({
        postMessage: () => undefined,
        addEventListener,
        removeEventListener: () => undefined,
      }),
    }).subscribe(() => undefined);
    expect(addEventListener).toHaveBeenCalledWith(
      "message",
      expect.any(Function),
    );
  });

  it("should remove the message listener it added", () => {
    const listeners: (() => void)[] = [];
    const removeEventListener = vi.fn();
    const unsubscribe = createLocalStorageLocationRepository({
      getStorage: useBrowserStorage,
      createChannel: () => ({
        postMessage: () => undefined,
        addEventListener: (_type, listener) => listeners.push(listener),
        removeEventListener,
      }),
    }).subscribe(() => undefined);
    unsubscribe();
    expect(removeEventListener).toHaveBeenCalledWith("message", listeners[0]);
  });

  it("should not fail when persist answers nothing", () => {
    vi.stubGlobal("navigator", { storage: { persist: () => undefined } });
    expect(
      createRepository().save({ locations: [moscow], homeLocationId: null }),
    ).toBe(SaveOutcome.SAVED);
  });

  it("should not fail when the storage manager has no persist", () => {
    vi.stubGlobal("navigator", { storage: {} });
    expect(
      createRepository().save({ locations: [moscow], homeLocationId: null }),
    ).toBe(SaveOutcome.SAVED);
  });
});
