// Verifies FR9 of add-main-page-scaffold: one contract, every adapter.
import { STORAGE_AVAILABILITY_PROBE_KEY } from "@/constants";
import { inMemoryStorageAvailability } from "./inMemoryStorageAvailability";
import {
  createLocalStorageAvailability,
  localStorageAvailability,
} from "./localStorageAvailability";
import { describeStorageAvailabilityContract } from "./storageAvailability.contract";

const createFailingStorage = (): Storage => ({
  ...localStorage,
  setItem: () => {
    throw new DOMException("quota", "QuotaExceededError");
  },
  removeItem: () => {},
});

describeStorageAvailabilityContract("local storage", {
  createAvailable: () => createLocalStorageAvailability(localStorage),
  createUnavailable: () =>
    createLocalStorageAvailability(createFailingStorage()),
});

describeStorageAvailabilityContract("in-memory", {
  createAvailable: () => inMemoryStorageAvailability(true),
  createUnavailable: () => inMemoryStorageAvailability(false),
});

describe("local storage availability probe", () => {
  it("should leave no probe key behind", () => {
    createLocalStorageAvailability(localStorage).isStorageAvailable();
    expect(localStorage.getItem(STORAGE_AVAILABILITY_PROBE_KEY)).toBeNull();
  });

  it("should report unavailable when removing the probe throws", () => {
    const storage = {
      ...localStorage,
      setItem: () => {},
      removeItem: () => {
        throw new Error("blocked");
      },
    } as Storage;
    expect(createLocalStorageAvailability(storage).isStorageAvailable()).toBe(
      false,
    );
  });
});

describe("browser local storage availability", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should report available when the browser storage works", () => {
    expect(localStorageAvailability.isStorageAvailable()).toBe(true);
  });

  it("should report unavailable when reading the storage object throws", () => {
    vi.spyOn(globalThis, "localStorage", "get").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    expect(localStorageAvailability.isStorageAvailable()).toBe(false);
    vi.restoreAllMocks();
  });
});
