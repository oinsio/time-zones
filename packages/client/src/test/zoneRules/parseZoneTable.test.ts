// Verifies FR2 of add-city-coordinates-to-locations (D3): the zone table parser.
import { describe, expect, it } from "vitest";
import { parseZoneTable } from "../../../scripts/zoneRules/parseZoneTable.ts";

const row = (coordinates: string, zoneId: string) =>
  `RU\t${coordinates}\t${zoneId}\tMoscow area`;

describe("parseZoneTable", () => {
  it("should skip comment lines and blank lines", () => {
    const table = [
      "# tzdb timezone descriptions",
      "",
      row("+554521+0373704", "Europe/Moscow"),
    ].join("\n");
    expect([...parseZoneTable(table).keys()]).toEqual(["Europe/Moscow"]);
  });

  it.each([
    ["degrees, minutes and seconds", "+554521+0373704", [558, 376]],
    ["degrees and minutes", "+2232+08822", [225, 884]],
    ["southern and eastern signs", "-3352+15113", [-339, 1512]],
    ["western sign", "+4042-07400", [407, -740]],
    [
      "a western half tenth rounded as the city data rounds it",
      "+6409-02151",
      [642, -218],
    ],
    ["both signs negative", "-2332-04637", [-235, -466]],
  ])("should read %s", (_, coordinates, expected) => {
    const table = parseZoneTable(row(coordinates, "Zone/Id"));
    expect(table.get("Zone/Id")).toEqual(expected);
  });

  it.each([
    ["a row without coordinates", "RU\tEurope/Moscow"],
    ["a malformed coordinate pair", row("55N37E", "Europe/Moscow")],
    [
      "a coordinate pair without a sign",
      row("554521+0373704", "Europe/Moscow"),
    ],
    ["coordinates of the wrong length", row("+55452+0373704", "Europe/Moscow")],
  ])("should throw naming the line for %s", (_, badRow) => {
    const table = [
      "# comment",
      row("+2232+08822", "Asia/Kolkata"),
      badRow,
    ].join("\n");
    expect(() => parseZoneTable(table)).toThrow(/line 3/);
  });
});

describe("parseZoneTable strictness", () => {
  it.each([
    ["text before the coordinates", "x+554521+0373704"],
    ["text after the coordinates", "+554521+0373704x"],
    ["a space inside the coordinates", "+554521 +0373704"],
  ])("should throw for %s", (_, coordinates) => {
    expect(() => parseZoneTable(row(coordinates, "Zone/Id"))).toThrow(/line 1/);
  });

  it("should skip a line of spaces", () => {
    expect([...parseZoneTable("   \n").keys()]).toEqual([]);
  });

  it("should throw naming the line for an empty zone ID", () => {
    expect(() => parseZoneTable("RU\t+2232+08822\t\n")).toThrow(/no zone ID/);
  });

  it("should write a zero for a place on the equator and the meridian, never a negative zero", () => {
    const [latitudeTenths, longitudeTenths] = parseZoneTable(
      row("-0000-00000", "Zone/Id"),
    ).get("Zone/Id") as [number, number];
    expect(Object.is(latitudeTenths, 0)).toBe(true);
    expect(Object.is(longitudeTenths, 0)).toBe(true);
  });

  it("should round half a tenth towards positive infinity as the city data does", () => {
    expect(
      parseZoneTable(row("+0003-00003", "Zone/Id")).get("Zone/Id"),
    ).toEqual([1, 0]);
  });
});
