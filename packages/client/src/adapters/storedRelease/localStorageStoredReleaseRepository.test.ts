// Verifies FR6, FR9 of add-remote-zone-rules-updates: the envelope and unreadable documents.
import { STORAGE_KEYS, STORED_RELEASE_SCHEMA_VERSION } from "@/constants";
import { SaveOutcome, StoredReleaseLoadStatus } from "@/ports";
import { buildReleaseDocument } from "@/test/zoneRules/buildReleaseDocument";
import {
  createLocalStorageStoredReleaseRepository,
  localStorageStoredReleaseRepository,
} from "./localStorageStoredReleaseRepository";

const createRepository = (getStorage: () => Storage = () => localStorage) =>
  createLocalStorageStoredReleaseRepository({ getStorage });

const blockedStorage = (): Storage => {
  throw new DOMException("denied", "SecurityError");
};

beforeEach(() => {
  localStorage.clear();
});

describe("local storage stored release repository", () => {
  it("should save an envelope with schema version 1 around the release", () => {
    const document = buildReleaseDocument("2026g");
    createRepository().save(document);
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.ZONE_RULES) ?? ""),
    ).toEqual({
      schemaVersion: STORED_RELEASE_SCHEMA_VERSION,
      payload: document,
    });
  });

  it.each([
    ["invalid JSON", "not valid JSON"],
    [
      "schema version 2",
      JSON.stringify({
        schemaVersion: 2,
        payload: buildReleaseDocument("2026g"),
      }),
    ],
    [
      "a missing schema version",
      JSON.stringify({ payload: buildReleaseDocument("2026g") }),
    ],
    [
      "a payload that is not a release",
      JSON.stringify({ schemaVersion: 1, payload: { release: 5 } }),
    ],
    ["a JSON null", "null"],
  ])("should load UNREADABLE for %s", (_name, rawDocument) => {
    localStorage.setItem(STORAGE_KEYS.ZONE_RULES, rawDocument);
    expect(createRepository().load()).toEqual({
      status: StoredReleaseLoadStatus.UNREADABLE,
    });
  });

  it("should load UNREADABLE when the storage cannot be read", () => {
    expect(createRepository(blockedStorage).load()).toEqual({
      status: StoredReleaseLoadStatus.UNREADABLE,
    });
  });

  it("should answer FAILED to save and clear when the storage cannot be read", () => {
    const repository = createRepository(blockedStorage);
    expect([
      repository.save(buildReleaseDocument("2026g")),
      repository.clear(),
    ]).toEqual([SaveOutcome.FAILED, SaveOutcome.FAILED]);
  });

  it("should not read the storage when created", () => {
    const getStorage = vi.fn(blockedStorage);
    createRepository(getStorage);
    expect(getStorage).not.toHaveBeenCalled();
  });
});

describe("the app's stored release repository", () => {
  it("should keep the release in the browser's local storage", () => {
    localStorageStoredReleaseRepository.save(buildReleaseDocument("2026g"));
    expect(localStorage.getItem(STORAGE_KEYS.ZONE_RULES)).not.toBeNull();
    expect(localStorageStoredReleaseRepository.load().status).toBe(
      StoredReleaseLoadStatus.LOADED,
    );
  });
});
