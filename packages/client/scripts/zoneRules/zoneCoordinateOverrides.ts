/**
 * Coordinates, in tenths of a degree, of a zone city that the zone table
 * (`zone.tab`) does not list. The compile writes them into the zone
 * coordinates file (design D3); empty today.
 * Implements FR2 of add-city-coordinates-to-locations (D3).
 */
import type { ZoneTenths } from "./parseZoneTable.ts";

export const ZONE_COORDINATE_OVERRIDES: Readonly<Record<string, ZoneTenths>> =
  {};
