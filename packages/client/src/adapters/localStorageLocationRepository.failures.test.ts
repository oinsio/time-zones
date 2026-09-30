// Verifies FR12–FR14 (failures, storage events) of add-locations-via-search (D4).
import { STORAGE_KEYS } from "@/constants";
import { LocationsLoadStatus, SaveOutcome } from "@/ports";
import {
  createRepository,
  moscow,
  useBrowserStorage,
} from "@/test/localStorageRepositoryHelpers";
import { createLocalStorageLocationRepository } from "./localStorageLocationRepository";

beforeEach(() => {
  localStorage.clear();
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
