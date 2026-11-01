// Verifies FR7 of add-settings-page-and-device-time-location: one contract, every adapter.
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/constants";
import { PreferencesLoadStatus, SaveOutcome } from "@/ports";
import {
  DEFAULT_PREFERENCES,
  HourFormat,
  ThemePreference,
} from "@/preferences";
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
        schemaVersion: 3,
        payload: { theme: "DARK", hourFormat: "H12", interfaceLanguage: null },
      }),
    ],
    [
      "an unknown value",
      JSON.stringify({
        schemaVersion: 2,
        payload: { theme: "SEPIA", hourFormat: "H12", interfaceLanguage: null },
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
        interfaceLanguage: null,
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
    first.save({
      theme: ThemePreference.DARK,
      hourFormat: HourFormat.H12,
      interfaceLanguage: "ru",
    });
    expect(JSON.parse(storage.getItem(STORAGE_KEYS.PREFERENCES) ?? "")).toEqual(
      {
        schemaVersion: 2,
        payload: { theme: "DARK", hourFormat: "H12", interfaceLanguage: "ru" },
      },
    );
  });
});

describe("legacy language key", () => {
  // Verifies FR8 of add-interface-language-selection (D2)
  it("should load the legacy key without a document and write nothing", () => {
    const { storage, first } = createStorageScenario();
    const setItem = vi.spyOn(storage, "setItem");
    storage.setItem(LEGACY_STORAGE_KEYS.LANGUAGE, "ru");
    setItem.mockClear();
    expect(first.load()).toMatchObject({
      status: PreferencesLoadStatus.LOADED,
      preferences: { interfaceLanguage: "ru" },
    });
    expect(setItem).not.toHaveBeenCalled();
  });

  it("should load an empty legacy key as empty", () => {
    const { storage, first } = createStorageScenario();
    storage.setItem(LEGACY_STORAGE_KEYS.LANGUAGE, "");
    expect(first.load()).toEqual({ status: PreferencesLoadStatus.EMPTY });
  });

  it("should migrate a version 1 document with the legacy key", () => {
    const { storage, first } = createStorageScenario();
    storage.setItem(LEGACY_STORAGE_KEYS.LANGUAGE, "ru");
    storage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify({
        schemaVersion: 1,
        payload: { theme: "DARK", hourFormat: "H12" },
      }),
    );
    expect(first.load()).toMatchObject({
      preferences: { theme: "DARK", interfaceLanguage: "ru" },
    });
  });

  it("should remove the legacy key on save", () => {
    const { storage, first } = createStorageScenario();
    storage.setItem(LEGACY_STORAGE_KEYS.LANGUAGE, "ru");
    first.save({ ...DEFAULT_PREFERENCES, interfaceLanguage: "ru" });
    expect(storage.getItem(LEGACY_STORAGE_KEYS.LANGUAGE)).toBeNull();
  });

  it("should remove the legacy key on clear", () => {
    const { storage, first } = createStorageScenario();
    storage.setItem(LEGACY_STORAGE_KEYS.LANGUAGE, "ru");
    first.clear();
    expect(storage.getItem(LEGACY_STORAGE_KEYS.LANGUAGE)).toBeNull();
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
      interfaceLanguage: null,
    });
    expect(outcome).toBe(SaveOutcome.FAILED);
    expect(repository.load()).toEqual({ status: PreferencesLoadStatus.EMPTY });
  });
});
