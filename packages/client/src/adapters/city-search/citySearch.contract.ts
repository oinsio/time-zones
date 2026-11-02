import { describe, expect, it } from "vitest";
import type { CityNameLanguage } from "@/constants";
import type { CitySearch } from "@/ports";

export interface CitySearchScenario {
  createSearch: () => CitySearch;
  /** Zones with CLDR data and the names expected per language. */
  namedZones: readonly {
    timeZoneId: string;
    language: CityNameLanguage;
    cityName: string;
  }[];
  /** A canonical zone without CLDR data and its derived name. */
  derivedZone: { timeZoneId: string; cityName: string };
  /** Stored labels of a zone with data, and the label expected per language. */
  cityLabels: readonly {
    timeZoneId: string;
    storedLabel: string;
    language: CityNameLanguage;
    cityLabel: string;
  }[];
}

/**
 * Contract every `CitySearch` must satisfy for the exemplar city (ADR-0006).
 * Verifies FR8, FR12 of show-here-entry-for-device-time.
 * Verifies FR1 of show-city-labels-in-interface-language (D2).
 */
export const describeCitySearchContract = (
  searchName: string,
  scenario: CitySearchScenario,
) => {
  describe(`CitySearch contract: ${searchName}`, () => {
    // FR8: the exemplar city comes from the data in the interface language
    it.each(scenario.namedZones)(
      "should name $timeZoneId as $cityName in $language",
      ({ timeZoneId, language, cityName }) => {
        expect(
          scenario.createSearch().getExemplarCity(timeZoneId, language),
        ).toBe(cityName);
      },
    );

    // FR12: a zone without data is named from its ID
    it("should derive the name of a zone without data", () => {
      const { timeZoneId, cityName } = scenario.derivedZone;

      expect(scenario.createSearch().getExemplarCity(timeZoneId, "en")).toBe(
        cityName,
      );
    });
    // FR1: city label in the city-name language
    it.each(scenario.cityLabels)(
      "should label $timeZoneId stored as «$storedLabel» as «$cityLabel» in $language",
      ({ timeZoneId, storedLabel, language, cityLabel }) => {
        expect(
          scenario
            .createSearch()
            .getCityLabel(timeZoneId, storedLabel, language),
        ).toBe(cityLabel);
      },
    );
  });
};
