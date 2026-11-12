// Verifies FR6, FR9 of add-remote-zone-rules-updates: one contract, every adapter.
import { STORAGE_KEYS } from "@/constants";
import {
  createInMemoryStoredReleaseRepository,
  createLocalStorageStoredReleaseRepository,
} from "./storedRelease";
import { describeStoredReleaseRepositoryContract } from "./storedReleaseRepository.contract";

describeStoredReleaseRepositoryContract("in-memory", {
  createRepository: () => createInMemoryStoredReleaseRepository(),
  seedOtherDocuments: () => undefined,
  readOtherDocuments: () => undefined,
});

const OTHER_KEYS = [STORAGE_KEYS.LOCATIONS, STORAGE_KEYS.PREFERENCES];

describeStoredReleaseRepositoryContract("localStorage", {
  createRepository: () => {
    localStorage.clear();
    return createLocalStorageStoredReleaseRepository({
      getStorage: () => localStorage,
    });
  },
  seedOtherDocuments: () => {
    for (const key of OTHER_KEYS) localStorage.setItem(key, `{"of":"${key}"}`);
  },
  readOtherDocuments: () => OTHER_KEYS.map((key) => localStorage.getItem(key)),
});
