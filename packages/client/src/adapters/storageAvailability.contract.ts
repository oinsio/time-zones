import type { StorageAvailability } from "@/ports";

export interface StorageAvailabilityScenario {
  /** Adapter configured so that storage is usable. */
  createAvailable: () => StorageAvailability;
  /** Adapter configured so that storage cannot be used. */
  createUnavailable: () => StorageAvailability;
}

/**
 * Contract every `StorageAvailability` adapter must satisfy.
 * Verifies FR9 of add-main-page-scaffold.
 */
export const describeStorageAvailabilityContract = (
  adapterName: string,
  scenario: StorageAvailabilityScenario,
) => {
  describe(`StorageAvailability contract: ${adapterName}`, () => {
    it("should report storage as available when it can be used", () => {
      expect(scenario.createAvailable().isStorageAvailable()).toBe(true);
    });

    it("should report storage as unavailable when it cannot be used", () => {
      expect(scenario.createUnavailable().isStorageAvailable()).toBe(false);
    });

    it("should give the same answer on repeated calls", () => {
      const adapter = scenario.createAvailable();
      adapter.isStorageAvailable();
      expect(adapter.isStorageAvailable()).toBe(true);
    });
  });
};
