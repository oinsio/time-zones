/**
 * Pure parsers for one line of the GeoNames dumps; a malformed line throws
 * with its line number.
 * Implements FR1, FR2 of add-geonames-city-source (D8).
 * Implements FR1, FR4 of add-city-coordinates-to-locations (D2).
 */

import {
  MAX_LATITUDE_DEGREES,
  MAX_LONGITUDE_DEGREES,
} from "../../src/constants/coordinates.ts";
import type {
  Admin1Row,
  AlternateNameRow,
  GeoNamesCityRow,
} from "./cityDataTypes.ts";
import { COLUMN_SEPARATOR, FLAG_TRUE } from "./constants.ts";

const CITY_COLUMNS = {
  geonameId: 0,
  name: 1,
  featureCode: 7,
  countryCode: 8,
  latitude: 4,
  longitude: 5,
  admin1Code: 10,
  population: 14,
  timeZoneId: 17,
  count: 18,
} as const;
const ALTERNATE_COLUMNS = {
  geonameId: 1,
  language: 2,
  name: 3,
  isPreferred: 4,
  isShort: 5,
  isColloquial: 6,
  isHistoric: 7,
  count: 8,
} as const;
const ADMIN1_COLUMNS = { key: 0, name: 1, geonameId: 3, count: 4 } as const;

function readColumn(columns: string[], index: number): string {
  return columns[index] ?? "";
}

function splitLine(line: string, columnCount: number, lineNumber: number) {
  const columns = line.split(COLUMN_SEPARATOR);
  if (columns.length < columnCount) {
    throw new Error(
      `Malformed GeoNames line ${lineNumber}: expected ${columnCount} columns, found ${columns.length}`,
    );
  }
  return columns;
}

function readNumber(text: string, field: string, lineNumber: number): number {
  const value = Number(text);
  if (text === "" || !Number.isInteger(value)) {
    throw new Error(
      `Malformed GeoNames line ${lineNumber}: ${field} "${text}" is not an integer`,
    );
  }
  return value;
}

function readDegrees(
  text: string,
  field: string,
  limit: number,
  lineNumber: number,
): number {
  const value = Number(text);
  if (text.trim() === "" || !Number.isFinite(value) || Math.abs(value) > limit) {
    throw new Error(
      `Malformed GeoNames line ${lineNumber}: ${field} "${text}" is not a number within ±${limit}`,
    );
  }
  return value;
}

export function parseCityRow(
  line: string,
  lineNumber: number,
): GeoNamesCityRow {
  const columns = splitLine(line, CITY_COLUMNS.count, lineNumber);
  return {
    geonameId: readNumber(
      readColumn(columns, CITY_COLUMNS.geonameId),
      "ID",
      lineNumber,
    ),
    name: readColumn(columns, CITY_COLUMNS.name),
    countryCode: readColumn(columns, CITY_COLUMNS.countryCode),
    admin1Code: readColumn(columns, CITY_COLUMNS.admin1Code),
    featureCode: readColumn(columns, CITY_COLUMNS.featureCode),
    population: readNumber(
      readColumn(columns, CITY_COLUMNS.population),
      "population",
      lineNumber,
    ),
    timeZoneId: readColumn(columns, CITY_COLUMNS.timeZoneId),
    latitude: readDegrees(
      readColumn(columns, CITY_COLUMNS.latitude),
      "latitude",
      MAX_LATITUDE_DEGREES,
      lineNumber,
    ),
    longitude: readDegrees(
      readColumn(columns, CITY_COLUMNS.longitude),
      "longitude",
      MAX_LONGITUDE_DEGREES,
      lineNumber,
    ),
  };
}

export function parseAlternateNameRow(
  line: string,
  lineNumber: number,
): AlternateNameRow {
  const columns = splitLine(line, ALTERNATE_COLUMNS.count, lineNumber);
  return {
    geonameId: readNumber(
      readColumn(columns, ALTERNATE_COLUMNS.geonameId),
      "ID",
      lineNumber,
    ),
    language: readColumn(columns, ALTERNATE_COLUMNS.language),
    name: readColumn(columns, ALTERNATE_COLUMNS.name),
    isPreferred:
      readColumn(columns, ALTERNATE_COLUMNS.isPreferred) === FLAG_TRUE,
    isShort: readColumn(columns, ALTERNATE_COLUMNS.isShort) === FLAG_TRUE,
    isColloquial:
      readColumn(columns, ALTERNATE_COLUMNS.isColloquial) === FLAG_TRUE,
    isHistoric: readColumn(columns, ALTERNATE_COLUMNS.isHistoric) === FLAG_TRUE,
  };
}

export function parseAdmin1Row(line: string, lineNumber: number): Admin1Row {
  const columns = splitLine(line, ADMIN1_COLUMNS.count, lineNumber);
  return {
    key: readColumn(columns, ADMIN1_COLUMNS.key),
    name: readColumn(columns, ADMIN1_COLUMNS.name),
    geonameId: readNumber(
      readColumn(columns, ADMIN1_COLUMNS.geonameId),
      "ID",
      lineNumber,
    ),
  };
}
