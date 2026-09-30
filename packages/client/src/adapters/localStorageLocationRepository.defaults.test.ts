// Verifies FR11, FR13 (persistence request, defaults) of add-locations-via-search (D4).
import { LOCATIONS_SYNC_CHANNEL_NAME, STORAGE_KEYS } from "@/constants";
import { SaveOutcome } from "@/ports";
import {
  createRepository,
  moscow,
  useBrowserStorage,
} from "@/test/localStorageRepositoryHelpers";
import {
  createLocalStorageLocationRepository,
  localStorageLocationRepository,
} from "./localStorageLocationRepository";

beforeEach(() => {
  localStorage.clear();
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
