import {
  type LocationRepository,
  type LocationsLoadResult,
  LocationsLoadStatus,
  SaveOutcome,
} from "@/ports";
import { buildLocation } from "@/test/factories/buildLocation";

export interface LocationRepositoryScenario {
  /** Two empty repository instances that see each other's changes. */
  createPair: () => { first: LocationRepository; second: LocationRepository };
}

const almaty = buildLocation({
  timeZoneId: "Asia/Almaty",
  label: "Almaty",
  countryCode: "KZ",
});
const moscow = buildLocation();

/**
 * Contract every `LocationRepository` adapter must satisfy.
 * Verifies FR11, FR13, FR14 of add-locations-via-search (D4).
 */
export const describeLocationRepositoryContract = (
  adapterName: string,
  scenario: LocationRepositoryScenario,
) => {
  describe(`LocationRepository contract: ${adapterName}`, () => {
    it("should load an empty result before anything is saved", () => {
      expect(scenario.createPair().first.load()).toEqual({
        status: LocationsLoadStatus.EMPTY,
      });
    });

    it("should load what was saved in the same order", () => {
      const { first } = scenario.createPair();
      expect(first.save([almaty, moscow])).toBe(SaveOutcome.SAVED);
      expect(first.load()).toEqual({
        status: LocationsLoadStatus.LOADED,
        locations: [almaty, moscow],
      });
    });

    it("should let another instance load what was saved", () => {
      const { first, second } = scenario.createPair();
      first.save([moscow]);
      expect(second.load()).toEqual({
        status: LocationsLoadStatus.LOADED,
        locations: [moscow],
      });
    });

    it("should load an empty result after clear", () => {
      const { first } = scenario.createPair();
      first.save([moscow]);
      expect(first.clear()).toBe(SaveOutcome.SAVED);
      expect(first.load()).toEqual({ status: LocationsLoadStatus.EMPTY });
    });

    it("should answer save with an outcome instead of throwing", () => {
      const { first } = scenario.createPair();
      expect(() => first.save([])).not.toThrow();
    });

    it("should tell a subscriber of another instance about a save", () => {
      const { first, second } = scenario.createPair();
      const received: LocationsLoadResult[] = [];
      second.subscribe((result) => received.push(result));
      first.save([almaty]);
      expect(received).toEqual([
        { status: LocationsLoadStatus.LOADED, locations: [almaty] },
      ]);
    });

    it("should tell a subscriber of another instance about a clear", () => {
      const { first, second } = scenario.createPair();
      first.save([almaty]);
      const received: LocationsLoadResult[] = [];
      second.subscribe((result) => received.push(result));
      first.clear();
      expect(received).toEqual([{ status: LocationsLoadStatus.EMPTY }]);
    });

    it("should not tell a subscriber about the change its own instance made", () => {
      const { first } = scenario.createPair();
      const received: LocationsLoadResult[] = [];
      first.subscribe((result) => received.push(result));
      first.save([almaty]);
      expect(received).toEqual([]);
    });

    it("should stop telling a subscriber after it unsubscribes", () => {
      const { first, second } = scenario.createPair();
      const received: LocationsLoadResult[] = [];
      const unsubscribe = second.subscribe((result) => received.push(result));
      unsubscribe();
      first.save([almaty]);
      expect(received).toEqual([]);
    });
  });
};
