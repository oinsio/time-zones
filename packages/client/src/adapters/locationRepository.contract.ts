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
 * Verifies FR8, FR10 of set-home-location-and-show-differences (D6): home.
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
      expect(
        first.save({ locations: [almaty, moscow], homeLocationId: null }),
      ).toBe(SaveOutcome.SAVED);
      expect(first.load()).toEqual({
        status: LocationsLoadStatus.LOADED,
        locations: [almaty, moscow],
        homeLocationId: null,
      });
    });

    it("should let another instance load what was saved", () => {
      const { first, second } = scenario.createPair();
      first.save({ locations: [moscow], homeLocationId: null });
      expect(second.load()).toEqual({
        status: LocationsLoadStatus.LOADED,
        locations: [moscow],
        homeLocationId: null,
      });
    });

    it("should load an empty result after clear", () => {
      const { first } = scenario.createPair();
      first.save({ locations: [moscow], homeLocationId: null });
      expect(first.clear()).toBe(SaveOutcome.SAVED);
      expect(first.load()).toEqual({ status: LocationsLoadStatus.EMPTY });
    });

    it("should load the home location that was saved", () => {
      const { first } = scenario.createPair();
      first.save({ locations: [almaty, moscow], homeLocationId: almaty.id });
      expect(first.load()).toEqual({
        status: LocationsLoadStatus.LOADED,
        locations: [almaty, moscow],
        homeLocationId: almaty.id,
      });
    });

    it("should load no home after clear", () => {
      const { first } = scenario.createPair();
      first.save({ locations: [almaty], homeLocationId: almaty.id });
      first.clear();
      expect(first.load()).toEqual({ status: LocationsLoadStatus.EMPTY });
    });

    it("should tell a subscriber of another instance about the home", () => {
      const { first, second } = scenario.createPair();
      const received: LocationsLoadResult[] = [];
      second.subscribe((result) => received.push(result));
      first.save({ locations: [almaty], homeLocationId: almaty.id });
      expect(received).toEqual([
        {
          status: LocationsLoadStatus.LOADED,
          locations: [almaty],
          homeLocationId: almaty.id,
        },
      ]);
    });

    it("should answer save with an outcome instead of throwing", () => {
      const { first } = scenario.createPair();
      expect(() =>
        first.save({ locations: [], homeLocationId: null }),
      ).not.toThrow();
    });

    it("should tell a subscriber of another instance about a save", () => {
      const { first, second } = scenario.createPair();
      const received: LocationsLoadResult[] = [];
      second.subscribe((result) => received.push(result));
      first.save({ locations: [almaty], homeLocationId: null });
      expect(received).toEqual([
        {
          status: LocationsLoadStatus.LOADED,
          locations: [almaty],
          homeLocationId: null,
        },
      ]);
    });

    it("should tell a subscriber of another instance about a clear", () => {
      const { first, second } = scenario.createPair();
      first.save({ locations: [almaty], homeLocationId: null });
      const received: LocationsLoadResult[] = [];
      second.subscribe((result) => received.push(result));
      first.clear();
      expect(received).toEqual([{ status: LocationsLoadStatus.EMPTY }]);
    });

    it("should not tell a subscriber about the change its own instance made", () => {
      const { first } = scenario.createPair();
      const received: LocationsLoadResult[] = [];
      first.subscribe((result) => received.push(result));
      first.save({ locations: [almaty], homeLocationId: null });
      expect(received).toEqual([]);
    });

    it("should stop telling a subscriber after it unsubscribes", () => {
      const { first, second } = scenario.createPair();
      const received: LocationsLoadResult[] = [];
      const unsubscribe = second.subscribe((result) => received.push(result));
      unsubscribe();
      first.save({ locations: [almaty], homeLocationId: null });
      expect(received).toEqual([]);
    });
  });
};
