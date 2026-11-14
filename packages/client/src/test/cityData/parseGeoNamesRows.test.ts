// Verifies FR1, FR2 of add-geonames-city-source (D8): pure row parsers.
import { describe, expect, it } from "vitest";
import {
  parseAdmin1Row,
  parseAlternateNameRow,
  parseCityRow,
} from "../../../scripts/cityData/parseGeoNamesRows.ts";

const CITY_LINE = [
  "551487",
  "Kazan",
  "Kazan",
  "Kasan,Казань",
  "55.78874",
  "49.12214",
  "P",
  "PPLA",
  "RU",
  "",
  "73",
  "",
  "",
  "",
  "1243500",
  "",
  "116",
  "Europe/Moscow",
  "2023-01-01",
].join("\t");

describe("parseCityRow", () => {
  it("should read the fields of a city line", () => {
    expect(parseCityRow(CITY_LINE, 1)).toEqual({
      geonameId: 551487,
      name: "Kazan",
      countryCode: "RU",
      admin1Code: "73",
      featureCode: "PPLA",
      population: 1243500,
      timeZoneId: "Europe/Moscow",
    });
  });

  it.each([
    ["too few columns", "1\tKazan"],
    ["a non-numeric ID", CITY_LINE.replace("551487", "abc")],
    ["a non-numeric population", CITY_LINE.replace("1243500", "many")],
  ])("should throw with the line number for %s", (_, line) => {
    expect(() => parseCityRow(line, 7)).toThrow(/line 7/);
  });
});

describe("parseAlternateNameRow", () => {
  it("should read language, name and flags", () => {
    const line = ["1", "551487", "ru", "Казань", "1", "", "", "", "", ""].join(
      "\t",
    );
    expect(parseAlternateNameRow(line, 1)).toEqual({
      geonameId: 551487,
      language: "ru",
      name: "Казань",
      isPreferred: true,
      isShort: false,
      isColloquial: false,
      isHistoric: false,
    });
  });

  it("should read the colloquial and historic flags", () => {
    const line = ["1", "5", "ru", "Х", "", "1", "1", "1", "", ""].join("\t");
    expect(parseAlternateNameRow(line, 1)).toMatchObject({
      isShort: true,
      isColloquial: true,
      isHistoric: true,
    });
  });

  it("should throw with the line number for a malformed line", () => {
    expect(() => parseAlternateNameRow("1\tx", 3)).toThrow(/line 3/);
  });
});

describe("parseAdmin1Row", () => {
  it("should read key, name and geoname ID", () => {
    expect(parseAdmin1Row("US.IL\tIllinois\tIllinois\t4896861", 1)).toEqual({
      key: "US.IL",
      name: "Illinois",
      geonameId: 4896861,
    });
  });

  it("should throw with the line number for a malformed line", () => {
    expect(() => parseAdmin1Row("US.IL", 2)).toThrow(/line 2/);
  });
});

describe("parse errors name the field", () => {
  it.each([
    [
      "the city ID",
      () => parseCityRow(CITY_LINE.replace("551487", "abc"), 7),
      'line 7: ID "abc"',
    ],
    [
      "the city population",
      () => parseCityRow(CITY_LINE.replace("1243500", "many"), 7),
      'line 7: population "many"',
    ],
    [
      "an empty city population",
      () => parseCityRow(CITY_LINE.replace("1243500", ""), 7),
      'line 7: population ""',
    ],
    [
      "the alternate name ID",
      () =>
        parseAlternateNameRow(
          ["1", "x", "ru", "Х", "", "", "", "", "", ""].join("\t"),
          4,
        ),
      'line 4: ID "x"',
    ],
    [
      "an empty alternate name ID",
      () =>
        parseAlternateNameRow(
          ["1", "", "ru", "Х", "", "", "", "", "", ""].join("\t"),
          4,
        ),
      'line 4: ID ""',
    ],
    [
      "the admin1 ID",
      () => parseAdmin1Row("US.IL\tIllinois\tIllinois\tx", 2),
      'line 2: ID "x"',
    ],
  ])("should name %s", (_, parse, message) => {
    expect(parse).toThrow(message);
  });

  it("should not take a fractional number for an integer", () => {
    expect(() => parseCityRow(CITY_LINE.replace("1243500", "1.5"), 1)).toThrow(
      "is not an integer",
    );
  });
});
