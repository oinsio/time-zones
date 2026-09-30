// Verifies FR9, FR11–FR14 of add-locations-via-search (D4).
import {
  LOCATIONS_SCHEMA_VERSION,
  LOCATIONS_SYNC_CHANNEL_NAME,
  STORAGE_KEYS,
} from "@/constants";
import { LocationsLoadStatus, SaveOutcome } from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";
import { createInMemoryChannelHub } from "@/test/inMemoryChannel";
import {
  createLocalStorageLocationRepository,
  localStorageLocationRepository,
} from "./localStorageLocationRepository";
import { describeLocationRepositoryContract } from "./locationRepository.contract";

const moscow = buildLocation();
const useBrowserStorage = () => localStorage;

const storeDocument = (document: unknown) =>
  localStorage.setItem(
    STORAGE_KEYS.LOCATIONS,
    typeof document === "string" ? document : JSON.stringify(document),
  );

const createRepository = () =>
  createLocalStorageLocationRepository({
    getStorage: useBrowserStorage,
    createChannel: () => undefined,
  });

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
    createRepository().save([moscow]);
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS) ?? ""),
    ).toEqual({
      schemaVersion: LOCATIONS_SCHEMA_VERSION,
      payload: {
        locations: [
          { timeZoneId: "Europe/Moscow", label: "Moscow", countryCode: "RU" },
        ],
      },
    });
  });

  it("should remove the stored document on clear", () => {
    const repository = createRepository();
    repository.save([moscow]);
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
      locations: [{ timeZoneId: "Asia/Kolkata" }],
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

describe("local storage location repository failures", () => {
  const blockedStorage = () => {
    throw new DOMException("denied", "SecurityError");
  };
  const createBlocked = (getStorage = blockedStorage) =>
    createLocalStorageLocationRepository({
      getStorage,
      createChannel: () => undefined,
    });

  it("should answer FAILED when setItem throws", () => {
    const repository = createLocalStorageLocationRepository({
      getStorage: () => ({
        ...localStorage,
        setItem: () => {
          throw new DOMException("quota", "QuotaExceededError");
        },
      }),
      createChannel: () => undefined,
    });
    expect(repository.save([moscow])).toBe(SaveOutcome.FAILED);
  });

  it("should not call getStorage when created", () => {
    const getStorage = vi.fn(blockedStorage);
    createBlocked(getStorage);
    expect(getStorage).not.toHaveBeenCalled();
  });

  it("should load empty when the storage cannot be read", () => {
    expect(createBlocked().load()).toEqual({
      status: LocationsLoadStatus.EMPTY,
    });
  });

  it("should answer FAILED to save and clear when the storage cannot be read", () => {
    const repository = createBlocked();
    expect([repository.save([moscow]), repository.clear()]).toEqual([
      SaveOutcome.FAILED,
      SaveOutcome.FAILED,
    ]);
  });

  it("should return a working unsubscribe when the storage cannot be read", () => {
    const unsubscribe = createBlocked().subscribe(() => undefined);
    expect(() => unsubscribe()).not.toThrow();
  });

  it("should not announce a failed save to other tabs", () => {
    const postMessage = vi.fn();
    const repository = createLocalStorageLocationRepository({
      getStorage: blockedStorage,
      createChannel: () => ({
        postMessage,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });
    repository.save([moscow]);
    expect(postMessage).not.toHaveBeenCalled();
  });

  it("should still save when creating the channel throws", () => {
    const repository = createLocalStorageLocationRepository({
      getStorage: useBrowserStorage,
      createChannel: () => {
        throw new Error("no channel");
      },
    });
    expect(repository.save([moscow])).toBe(SaveOutcome.SAVED);
  });

  it("should still save when posting to the channel throws", () => {
    const repository = createLocalStorageLocationRepository({
      getStorage: useBrowserStorage,
      createChannel: () => ({
        postMessage: () => {
          throw new Error("closed");
        },
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });
    expect(repository.save([moscow])).toBe(SaveOutcome.SAVED);
  });
});

describe("local storage location repository without BroadcastChannel", () => {
  const dispatchStorageEvent = (key: string | null) =>
    globalThis.dispatchEvent(new StorageEvent("storage", { key }));

  it("should report a storage event of the locations key", () => {
    const repository = createRepository();
    const listener = vi.fn();
    repository.subscribe(listener);
    localStorage.setItem(
      STORAGE_KEYS.LOCATIONS,
      JSON.stringify({ schemaVersion: 1, payload: { locations: [] } }),
    );
    dispatchStorageEvent(STORAGE_KEYS.LOCATIONS);
    expect(listener).toHaveBeenCalledWith({
      status: LocationsLoadStatus.LOADED,
      locations: [],
    });
  });

  it("should report a storage event that cleared all keys", () => {
    const listener = vi.fn();
    createRepository().subscribe(listener);
    dispatchStorageEvent(null);
    expect(listener).toHaveBeenCalledWith({
      status: LocationsLoadStatus.EMPTY,
    });
  });

  it("should ignore a storage event of another key", () => {
    const listener = vi.fn();
    createRepository().subscribe(listener);
    dispatchStorageEvent("other-key");
    expect(listener).not.toHaveBeenCalled();
  });

  it("should stop reporting after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = createRepository().subscribe(listener);
    unsubscribe();
    dispatchStorageEvent(STORAGE_KEYS.LOCATIONS);
    expect(listener).not.toHaveBeenCalled();
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
    repository.save([moscow]);
    repository.save([]);
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
    }).save([moscow]);
    expect(persist).not.toHaveBeenCalled();
  });

  it("should save when the browser has no storage manager", () => {
    vi.stubGlobal("navigator", {});
    expect(createRepository().save([moscow])).toBe(SaveOutcome.SAVED);
  });

  it("should save when persist rejects", () => {
    vi.stubGlobal("navigator", {
      storage: { persist: () => Promise.reject(new Error("denied")) },
    });
    expect(createRepository().save([moscow])).toBe(SaveOutcome.SAVED);
  });
});

describe("local storage location repository defaults", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should use the browser localStorage for the exported repository", () => {
    localStorageLocationRepository.save([moscow]);
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
    }).save([moscow]);
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
    expect(createRepository().save([moscow])).toBe(SaveOutcome.SAVED);
  });

  it("should not fail when the storage manager has no persist", () => {
    vi.stubGlobal("navigator", { storage: {} });
    expect(createRepository().save([moscow])).toBe(SaveOutcome.SAVED);
  });
});
