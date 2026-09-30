import { canonicalizeTimeZoneId } from "@/model";
import type { CitySource } from "./citySource";

export interface CitySourceScenario {
  createSource: () => CitySource;
  /** Normalized queries that produce results in this source. */
  queries: readonly string[];
}

/**
 * Contract every `CitySource` must satisfy (ADR-0006).
 * Verifies FR2–FR4, FR9 of add-locations-via-search.
 */
export const describeCitySourceContract = (
  sourceName: string,
  scenario: CitySourceScenario,
) => {
  describe(`CitySource contract: ${sourceName}`, () => {
    it("should hold records with canonical identifiers", () => {
      const source = scenario.createSource();
      const notCanonical = source.records.filter(
        (record) =>
          record.id !== record.timeZoneId ||
          canonicalizeTimeZoneId(record.timeZoneId) !== record.timeZoneId,
      );
      expect(notCanonical).toEqual([]);
    });

    it("should hold records with non-empty English and Russian names", () => {
      const source = scenario.createSource();
      const unnamed = source.records.filter(
        (record) => record.names.en === "" || record.names.ru === "",
      );
      expect(unnamed).toEqual([]);
    });

    it.each(scenario.queries)(
      "should return only its own records for %j",
      (query) => {
        const source = scenario.createSource();
        const results = source.match(query);
        expect(results.length).toBeGreaterThan(0);
        expect(
          results.every((result) => source.records.includes(result.record)),
        ).toBe(true);
      },
    );

    it("should return nothing for a query that matches nothing", () => {
      expect(scenario.createSource().match("qqqqqqqq")).toEqual([]);
    });
  });
};
