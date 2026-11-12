// @add-zone-rules-from-iana @FR8: comparing the committed release with zdump
import { describe, expect, it } from "vitest";
import { parseZdumpLines } from "../../../scripts/zoneRules/checkAgainstZdump.ts";
import { readZdumpFixture } from "./checkAgainstZdumpWorld";

describe("parseZdumpLines", () => {
  it("reads the instant, offset, designation and daylight flag of a line", () => {
    const entries = parseZdumpLines(
      "America/New_York  Sun Apr  2 07:00:00 2000 UT = Sun Apr  2 03:00:00 2000 EDT isdst=1 gmtoff=-14400",
    );
    expect(entries).toEqual([
      {
        epochSeconds: 954658800,
        utcOffsetSeconds: -14400,
        designation: "EDT",
        isDaylightSavingTime: true,
      },
    ]);
  });

  it("reads a numeric designation and a standard time flag", () => {
    const [entry] = parseZdumpLines(
      "Asia/Almaty  Sat Mar 25 19:59:59 2000 UT = Sun Mar 26 01:59:59 2000 +06 isdst=0 gmtoff=21600",
    );
    expect(entry).toMatchObject({
      designation: "+06",
      isDaylightSavingTime: false,
      utcOffsetSeconds: 21600,
    });
  });

  it("skips the NULL lines", () => {
    expect(parseZdumpLines(readZdumpFixture("Asia/Almaty")).length).toBe(22);
  });

  it.each([
    ["Jan", 1, 946684800 + 0],
    ["Feb", 2, 949363200],
    ["Mar", 3, 951868800],
    ["Apr", 4, 954547200],
    ["May", 5, 957139200],
    ["Jun", 6, 959817600],
    ["Jul", 7, 962409600],
    ["Aug", 8, 965088000],
    ["Sep", 9, 967766400],
    ["Oct", 10, 970358400],
    ["Nov", 11, 973036800],
    ["Dec", 12, 975628800],
  ])(
    "reads the month %s as month %i of the year",
    (monthName, _month, firstOfMonthEpochSeconds) => {
      const [entry] = parseZdumpLines(
        `Zone  Sat ${monthName}  1 00:00:00 2000 UT = Sat ${monthName}  1 00:00:00 2000 UTC isdst=0 gmtoff=0`,
      );
      expect(entry?.epochSeconds).toBe(firstOfMonthEpochSeconds);
    },
  );

  it("skips a line of spaces", () => {
    expect(parseZdumpLines("   \n")).toEqual([]);
  });

  it("skips empty lines", () => {
    expect(parseZdumpLines("\n\n")).toEqual([]);
  });

  it("reports a line it cannot read", () => {
    expect(() => parseZdumpLines("America/New_York  garbage")).toThrow(
      "garbage",
    );
  });
});
