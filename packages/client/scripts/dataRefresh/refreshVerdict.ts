/**
 * The refresh guard: turns a comparison of refreshed and committed data into a
 * verdict, with one reason per broken rule.
 * Implements FR2, FR7 of refresh-data-through-scheduled-pull-requests (D5, D6).
 */
import type { CityDataComparison } from "./compareCityData.ts";
import type { ZoneRulesComparison } from "./compareZoneRules.ts";
import {
  LARGE_CITY_POPULATION,
  MAX_REMOVED_CITY_SHARE,
  REFRESH_VERDICTS,
  type RefreshVerdict,
} from "./refreshConstants.ts";

const PERCENT_FACTOR = 100;
const PERCENT_DIGITS = 1;

export type RefreshDecision = {
  verdict: RefreshVerdict;
  reasons: string[];
};

function toDecision(reasons: string[]): RefreshDecision {
  return {
    verdict:
      reasons.length === 0
        ? REFRESH_VERDICTS.MERGE
        : REFRESH_VERDICTS.NEEDS_REVIEW,
    reasons,
  };
}

export function decideCityDataRefresh(
  comparison: CityDataComparison,
): RefreshDecision {
  if (comparison.isSameData) {
    return { verdict: REFRESH_VERDICTS.UNCHANGED, reasons: [] };
  }
  const reasons: string[] = [];
  if (comparison.removedShare > MAX_REMOVED_CITY_SHARE) {
    const percent = (comparison.removedShare * PERCENT_FACTOR).toFixed(
      PERCENT_DIGITS,
    );
    reasons.push(
      `${comparison.removedCities.length} committed cities are missing (${percent}% of them)`,
    );
  }
  for (const geonameId of comparison.removedLargeCities) {
    reasons.push(`The city with GeoNames ID ${geonameId} of at least ${LARGE_CITY_POPULATION} inhabitants is missing`);
  }
  for (const zoneId of comparison.removedZones) {
    reasons.push(`No city uses the zone ${zoneId} any more`);
  }
  return toDecision(reasons);
}

export function decideZoneRulesRefresh(
  comparison: ZoneRulesComparison,
): RefreshDecision {
  const reasons = [
    ...comparison.removedZoneIds.map(
      (zoneId) => `The zone identifier ${zoneId} of the committed release is missing`,
    ),
    ...comparison.zonesWithoutCoordinates.map(
      (zoneId) => `The coordinates of the zone ${zoneId} are missing`,
    ),
  ];
  return toDecision(reasons);
}
