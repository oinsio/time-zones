import type { StoredReleaseRepository } from "@/ports";
import { SaveOutcome, StoredReleaseLoadStatus } from "@/ports";
import { buildReleaseDocument } from "@/test/zoneRules/buildReleaseDocument";

export interface StoredReleaseRepositoryScenario {
  createRepository: () => StoredReleaseRepository;
  /** Writes the documents of other keys, and reads them back as text. */
  seedOtherDocuments: () => void;
  readOtherDocuments: () => unknown;
}

/**
 * Contract every `StoredReleaseRepository` adapter must satisfy.
 * Verifies FR6, FR9 of add-remote-zone-rules-updates (D2).
 */
export const describeStoredReleaseRepositoryContract = (
  adapterName: string,
  scenario: StoredReleaseRepositoryScenario,
) => {
  describe(`StoredReleaseRepository contract: ${adapterName}`, () => {
    it("should load empty before anything is saved", () => {
      expect(scenario.createRepository().load()).toEqual({
        status: StoredReleaseLoadStatus.EMPTY,
      });
    });

    it("should load the release that was saved", () => {
      const repository = scenario.createRepository();
      const document = buildReleaseDocument("2026g");
      expect(repository.save(document)).toBe(SaveOutcome.SAVED);
      const loaded = repository.load();
      expect(loaded).toMatchObject({
        status: StoredReleaseLoadStatus.LOADED,
        document,
      });
      expect(
        loaded.status === StoredReleaseLoadStatus.LOADED &&
          loaded.release.release,
      ).toBe("2026g");
    });

    it("should load empty after clear", () => {
      const repository = scenario.createRepository();
      repository.save(buildReleaseDocument("2026g"));
      expect(repository.clear()).toBe(SaveOutcome.SAVED);
      expect(repository.load().status).toBe(StoredReleaseLoadStatus.EMPTY);
    });

    it("should leave the other documents untouched by save and clear", () => {
      const repository = scenario.createRepository();
      scenario.seedOtherDocuments();
      const before = scenario.readOtherDocuments();
      repository.save(buildReleaseDocument("2026g"));
      repository.clear();
      expect(scenario.readOtherDocuments()).toEqual(before);
    });
  });
};
