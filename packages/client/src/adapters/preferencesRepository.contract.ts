import {
  PreferencesLoadStatus,
  type PreferencesRepository,
  SaveOutcome,
} from "@/ports";
import { HourFormat, type Preferences, ThemePreference } from "@/preferences";

export interface PreferencesRepositoryScenario {
  /** Two empty repository instances that see each other's changes. */
  createPair: () => {
    first: PreferencesRepository;
    second: PreferencesRepository;
  };
}

const darkTwelveHour: Preferences = {
  theme: ThemePreference.DARK,
  hourFormat: HourFormat.H12,
};

/**
 * Contract every `PreferencesRepository` adapter must satisfy.
 * Verifies FR7 of add-settings-page-and-device-time-location (D5).
 */
export const describePreferencesRepositoryContract = (
  adapterName: string,
  scenario: PreferencesRepositoryScenario,
) => {
  describe(`PreferencesRepository contract: ${adapterName}`, () => {
    it("should load an empty result before anything is saved", () => {
      expect(scenario.createPair().first.load()).toEqual({
        status: PreferencesLoadStatus.EMPTY,
      });
    });

    it("should load what was saved", () => {
      const { first } = scenario.createPair();
      expect(first.save(darkTwelveHour)).toBe(SaveOutcome.SAVED);
      expect(first.load()).toEqual({
        status: PreferencesLoadStatus.LOADED,
        preferences: darkTwelveHour,
      });
    });

    it("should load an empty result after clear", () => {
      const { first } = scenario.createPair();
      first.save(darkTwelveHour);
      expect(first.clear()).toBe(SaveOutcome.SAVED);
      expect(first.load()).toEqual({ status: PreferencesLoadStatus.EMPTY });
    });

    it("should tell another instance about a save", () => {
      const { first, second } = scenario.createPair();
      const received: unknown[] = [];
      second.subscribe((result) => received.push(result));
      first.save(darkTwelveHour);
      expect(received).toEqual([
        { status: PreferencesLoadStatus.LOADED, preferences: darkTwelveHour },
      ]);
    });

    it("should not tell the saving instance about its own save", () => {
      const { first } = scenario.createPair();
      const received: unknown[] = [];
      first.subscribe((result) => received.push(result));
      first.save(darkTwelveHour);
      expect(received).toEqual([]);
    });

    it("should stop telling an instance that unsubscribed", () => {
      const { first, second } = scenario.createPair();
      const received: unknown[] = [];
      second.subscribe((result) => received.push(result))();
      first.save(darkTwelveHour);
      expect(received).toEqual([]);
    });
  });
};
