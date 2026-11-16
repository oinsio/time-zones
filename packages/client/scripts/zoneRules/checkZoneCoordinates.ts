/**
 * Pure check of the committed zone coordinates file (design D4): its format,
 * its release against the bundled one, the ranges, and the coverage of every
 * zone city except UTC. It reads the committed file alone: overrides are
 * applied once, when the compile writes the file.
 * Implements FR3, FR4 of add-city-coordinates-to-locations (D4).
 */
import {
  COORDINATE_TENTHS_PER_DEGREE,
  MAX_LATITUDE_DEGREES,
  MAX_LONGITUDE_DEGREES,
} from "../../src/constants/coordinates.ts";
import { UTC_ZONE_ID } from "../../src/constants/search.ts";
import type { ZoneCityRecord } from "../zoneData/extractZoneData.ts";
import type { ZoneTenths } from "./parseZoneTable.ts";

const MAX_LATITUDE_TENTHS = MAX_LATITUDE_DEGREES * COORDINATE_TENTHS_PER_DEGREE;
const MAX_LONGITUDE_TENTHS =
  MAX_LONGITUDE_DEGREES * COORDINATE_TENTHS_PER_DEGREE;
const FORMAT_ERROR = "The zone coordinates are not in the format of design D3";

type ZoneCoordinatesDocument = {
  release: string;
  zones: Record<string, ZoneTenths>;
};

function isTenthsPair(value: unknown): value is ZoneTenths {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((entry) => Number.isInteger(entry))
  );
}

function parseDocument(text: string): ZoneCoordinatesDocument | undefined {
  let document: unknown;
  try {
    document = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (typeof document !== "object" || document === null) return undefined;
  const { release, zones } = document as Record<string, unknown>;
  if (typeof release !== "string") return undefined;
  if (typeof zones !== "object" || zones === null || Array.isArray(zones)) {
    return undefined;
  }
  if (!Object.values(zones).every(isTenthsPair)) return undefined;
  return { release, zones: zones as Record<string, ZoneTenths> };
}

function checkRanges(zones: Record<string, ZoneTenths>): string[] {
  const errors: string[] = [];
  for (const [zoneId, [latitude, longitude]] of Object.entries(zones)) {
    if (Math.abs(latitude) > MAX_LATITUDE_TENTHS) {
      errors.push(`The zone ${zoneId} has the latitude ${latitude}`);
    }
    if (Math.abs(longitude) > MAX_LONGITUDE_TENTHS) {
      errors.push(`The zone ${zoneId} has the longitude ${longitude}`);
    }
  }
  return errors;
}

/** The errors of the file's text, each naming its offender; empty when it passes. */
export function checkZoneCoordinates(
  zoneCoordinatesText: string,
  bundledRelease: string,
  zoneCities: readonly ZoneCityRecord[],
): string[] {
  const document = parseDocument(zoneCoordinatesText);
  if (document === undefined) return [FORMAT_ERROR];
  const errors: string[] = [];
  if (document.release !== bundledRelease) {
    errors.push(
      `The zone coordinates name the release ${document.release}, but the bundled zone rules release is ${bundledRelease}`,
    );
  }
  errors.push(...checkRanges(document.zones));
  const coordinatedZoneIds = new Set(Object.keys(document.zones));
  for (const { timeZoneId } of zoneCities) {
    if (timeZoneId !== UTC_ZONE_ID && !coordinatedZoneIds.has(timeZoneId)) {
      errors.push(`The zone city ${timeZoneId} has no zone coordinates`);
    }
  }
  return errors;
}
