/**
 * Parses the zone table (`zone.tab`) of an IANA release archive into the
 * coordinates of each zone's principal place, in integer tenths of a degree.
 * Implements FR2 of add-city-coordinates-to-locations (D3).
 */
import { COORDINATE_TENTHS_PER_DEGREE } from "../../src/constants/coordinates.ts";

const COLUMN_SEPARATOR = "\t";
const COMMENT_PREFIX = "#";
const ZONE_ID_COLUMN = 2;
const COORDINATES_COLUMN = 1;
/** ISO 6709: `±DDMM` or `±DDMMSS`, then `±DDDMM` or `±DDDMMSS`. */
const COORDINATES_PATTERN =
  /^([+-])(\d{2})(\d{2})(\d{2})?([+-])(\d{3})(\d{2})(\d{2})?$/;
const MINUTES_PER_DEGREE = 60;
const SECONDS_PER_DEGREE = 3600;

export type ZoneTenths = [latitudeTenths: number, longitudeTenths: number];

type ToTenthsArguments = [string, string, string, string | undefined];

function toTenths(
  sign: string,
  degrees: string,
  minutes: string,
  seconds: string | undefined,
): number {
  const absoluteDegrees =
    Number(degrees) +
    Number(minutes) / MINUTES_PER_DEGREE +
    Number(seconds ?? 0) / SECONDS_PER_DEGREE;
  const signedDegrees = sign === "-" ? -absoluteDegrees : absoluteDegrees;
  // `+ 0` turns -0 into 0, so the file never holds "-0".
  return Math.round(signedDegrees * COORDINATE_TENTHS_PER_DEGREE) + 0;
}

function parseCoordinates(text: string, lineNumber: number): ZoneTenths {
  const match = COORDINATES_PATTERN.exec(text);
  if (match === null) {
    throw new Error(
      `Malformed zone table line ${lineNumber}: coordinates "${text}" are not ISO 6709`,
    );
  }
  const parts = match.slice(1);
  return [
    toTenths(...(parts.slice(0, 4) as ToTenthsArguments)),
    toTenths(...(parts.slice(4) as ToTenthsArguments)),
  ];
}

/** Zone ID to coordinates in tenths of a degree, in file order. */
export function parseZoneTable(text: string): Map<string, ZoneTenths> {
  const zones = new Map<string, ZoneTenths>();
  text.split("\n").forEach((line, index) => {
    if (line.trim() === "" || line.startsWith(COMMENT_PREFIX)) return;
    const lineNumber = index + 1;
    const columns = line.split(COLUMN_SEPARATOR);
    const zoneId = columns[ZONE_ID_COLUMN];
    if (zoneId === undefined || zoneId === "") {
      throw new Error(`Malformed zone table line ${lineNumber}: no zone ID`);
    }
    zones.set(
      zoneId,
      parseCoordinates(columns[COORDINATES_COLUMN] ?? "", lineNumber),
    );
  });
  return zones;
}
