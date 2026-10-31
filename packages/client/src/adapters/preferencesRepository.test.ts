// Verifies FR7 of add-settings-page-and-device-time-location: one contract, every adapter.
import { STORAGE_KEYS } from "@/constants";
import { PreferencesLoadStatus, SaveOutcome } from "@/ports";
import { HourFormat, ThemePreference } from "@/preferences";
import { createInMemoryChannelHub } from "@/test/inMemoryChannel";
import {
  createInMemoryPreferencesBackend,
  createInMemoryPreferencesRepository,
} from "./inMemoryPreferencesRepository";
import { createLocalStoragePreferencesRepository } from "./localStoragePreferencesRepository";
import { describePreferencesRepositoryContract } from "./preferencesRepository.contract";

describePreferencesRepositoryContract("in-memory", {
  createPair: () => {
    const backend = createInMemoryPreferencesBackend();
    return {
      first: createInMemoryPreferencesRepository({ backend }),
      second: createInMemoryPreferencesRepository({ backend }),
    };
  },
});

const createStorageScenario = () => {
  const storage = createStorageStub();
  const hub = createInMemoryChannelHub();
  const create = () =>
    createLocalStoragePreferencesRepository({
      getStorage: () => storage,
      createChannel: hub.createChannel,
    });
  return { storage, first: create(), second: create() };
};

function createStorageStub(): Storage {
  const entries = new Map<string, string>();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => void entries.set(key, value),
    removeItem: (key) => void entries.delete(key),
    clear: () => entries.clear(),
    key: () => null,
    length: 0,
  };
}

describePreferencesRepositoryContract("localStorage", {
  createPair: createStorageScenario,
});

describe("localStorage preferences repository", () => {
  it.each([
    ["invalid JSON", "{not json"],
    [
      "a newer schema version",
      JSON.stringify({
        schemaVersion: 2,
        payload: { theme: "DARK", hourFormat: "H12" },
      }),
    ],
    [
      "an unknown value",
      JSON.stringify({
        schemaVersion: 1,
        payload: { theme: "SEPIA", hourFormat: "H12" },
      }),
    ],
  ])("should load %s as unreadable", (_name, rawDocument) => {
    const { storage, first } = createStorageScenario();
    storage.setItem(STORAGE_KEYS.PREFERENCES, rawDocument);
    expect(first.load()).toEqual({ status: PreferencesLoadStatus.UNREADABLE });
  });

  it("should answer FAILED to save when the storage throws", () => {
    const repository = createLocalStoragePreferencesRepository({
      getStorage: () => {
        throw new Error("storage denied");
      },
    });
    expect(
      repository.save({
        theme: ThemePreference.LIGHT,
        hourFormat: HourFormat.H24,
      }),
    ).toBe(SaveOutcome.FAILED);
  });

  it("should load an empty result when the storage throws", () => {
    const repository = createLocalStoragePreferencesRepository({
      getStorage: () => {
        throw new Error("storage denied");
      },
    });
    expect(repository.load()).toEqual({ status: PreferencesLoadStatus.EMPTY });
  });

  it("should store the schema version with the payload", () => {
    const { storage, first } = createStorageScenario();
    first.save({ theme: ThemePreference.DARK, hourFormat: HourFormat.H12 });
    expect(JSON.parse(storage.getItem(STORAGE_KEYS.PREFERENCES) ?? "")).toEqual(
      {
        schemaVersion: 1,
        payload: { theme: "DARK", hourFormat: "H12" },
      },
    );
  });
});

describe("in-memory preferences repository", () => {
  it("should answer FAILED to save and keep the document when not writable", () => {
    const repository = createInMemoryPreferencesRepository({
      isWritable: false,
    });
    const outcome = repository.save({
      theme: ThemePreference.DARK,
      hourFormat: HourFormat.H12,
    });
    expect(outcome).toBe(SaveOutcome.FAILED);
    expect(repository.load()).toEqual({ status: PreferencesLoadStatus.EMPTY });
  });
});
