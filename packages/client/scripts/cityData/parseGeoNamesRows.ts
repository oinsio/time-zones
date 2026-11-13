/**
 * Pure parsers for one line of the GeoNames dumps; a malformed line throws
 * with its line number.
 * Implements FR1, FR2 of add-geonames-city-source (D8).
 */
import { COLUMN_SEPARATOR, FLAG_TRUE } from "./constants.ts";
import type {
  Admin1Row,
  AlternateNameRow,
  GeoNamesCityRow,
} from "./cityDataTypes.ts";

const CITY_COLUMNS = {
  geonameId: 0,
  name: 1,
  featureCode: 7,
  countryCode: 8,
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

export function parseCityRow(line: string, lineNumber: number): GeoNamesCityRow {
  const columns = splitLine(line, CITY_COLUMNS.count, lineNumber);
  return {
    geonameId: readNumber(columns[CITY_COLUMNS.geonameId], "ID", lineNumber),
    name: columns[CITY_COLUMNS.name],
    countryCode: columns[CITY_COLUMNS.countryCode],
    admin1Code: columns[CITY_COLUMNS.admin1Code],
    featureCode: columns[CITY_COLUMNS.featureCode],
    population: readNumber(
      columns[CITY_COLUMNS.population],
      "population",
      lineNumber,
    ),
    timeZoneId: columns[CITY_COLUMNS.timeZoneId],
  };
}

export function parseAlternateNameRow(
  line: string,
  lineNumber: number,
): AlternateNameRow {
  const columns = splitLine(line, ALTERNATE_COLUMNS.count, lineNumber);
  return {
    geonameId: readNumber(columns[ALTERNATE_COLUMNS.geonameId], "ID", lineNumber),
    language: columns[ALTERNATE_COLUMNS.language],
    name: columns[ALTERNATE_COLUMNS.name],
    isPreferred: columns[ALTERNATE_COLUMNS.isPreferred] === FLAG_TRUE,
    isShort: columns[ALTERNATE_COLUMNS.isShort] === FLAG_TRUE,
    isColloquial: columns[ALTERNATE_COLUMNS.isColloquial] === FLAG_TRUE,
    isHistoric: columns[ALTERNATE_COLUMNS.isHistoric] === FLAG_TRUE,
  };
}

export function parseAdmin1Row(line: string, lineNumber: number): Admin1Row {
  const columns = splitLine(line, ADMIN1_COLUMNS.count, lineNumber);
  return {
    key: columns[ADMIN1_COLUMNS.key],
    name: columns[ADMIN1_COLUMNS.name],
    geonameId: readNumber(columns[ADMIN1_COLUMNS.geonameId], "ID", lineNumber),
  };
}
