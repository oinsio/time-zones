/**
 * Writes the zone coordinates file of design D3: the release name, then one
 * zone per line in alphabetical order, so a release bump reads as a diff.
 * Implements FR2, FR3 of add-city-coordinates-to-locations (D3).
 */
import type { ZoneTenths } from "./parseZoneTable.ts";
import { ZONE_COORDINATE_OVERRIDES } from "./zoneCoordinateOverrides.ts";

export type WriteZoneCoordinatesOptions = {
  release: string;
  /** The parsed zone table. */
  zones: ReadonlyMap<string, ZoneTenths>;
  /** Zones the table lacks, or corrections; defaults to the committed overrides. */
  overrides?: Readonly<Record<string, ZoneTenths>>;
};

export function writeZoneCoordinates(
  options: WriteZoneCoordinatesOptions,
): string {
  const entries = new Map(options.zones);
  const overrides = options.overrides ?? ZONE_COORDINATE_OVERRIDES;
  for (const [zoneId, tenths] of Object.entries(overrides)) {
    entries.set(zoneId, tenths);
  }
  const lines = [...entries.keys()]
    .sort()
    .map(
      (zoneId) =>
        `${JSON.stringify(zoneId)}:${JSON.stringify(entries.get(zoneId))}`,
    );
  return [
    `{"release":${JSON.stringify(options.release)},"zones":{`,
    lines.join(",\n"),
    "}}",
    "",
  ].join("\n");
}
