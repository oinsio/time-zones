// FR3 of add-zone-rules-from-iana: reading the POSIX TZ string of a TZif footer
import { describe, expect, it } from "vitest";
import { parseFutureRule } from "./futureRule.ts";
import { RuleDateKind } from "./zoneRulesConstants.ts";

const SECONDS_PER_HOUR = 3600;
const DEFAULT_TIME_SECONDS = 7200;

function monthWeekDay(
  month: number,
  week: number,
  weekday: number,
  timeSeconds = DEFAULT_TIME_SECONDS,
) {
  return {
    kind: RuleDateKind.MONTH_WEEK_DAY,
    month,
    week,
    weekday,
    timeSeconds,
  };
}

describe("parseFutureRule", () => {
  it("reads a rule with plain designations and default times", () => {
    expect(parseFutureRule("EST5EDT,M3.2.0,M11.1.0")).toEqual({
      standard: { designation: "EST", offsetSeconds: -5 * SECONDS_PER_HOUR },
      daylight: {
        designation: "EDT",
        offsetSeconds: -4 * SECONDS_PER_HOUR,
        start: monthWeekDay(3, 2, 0),
        end: monthWeekDay(11, 1, 0),
      },
    });
  });

  it("reads a negative daylight saving time rule with an explicit daylight offset", () => {
    expect(parseFutureRule("IST-1GMT0,M10.5.0,M3.5.0/1")).toEqual({
      standard: { designation: "IST", offsetSeconds: SECONDS_PER_HOUR },
      daylight: {
        designation: "GMT",
        offsetSeconds: 0,
        start: monthWeekDay(10, 5, 0),
        end: monthWeekDay(3, 5, 0, SECONDS_PER_HOUR),
      },
    });
  });

  it("reads angle-bracket designations and negative transition times", () => {
    expect(parseFutureRule("<-02>2<-01>,M3.5.0/-1,M10.5.0/0")).toEqual({
      standard: { designation: "-02", offsetSeconds: -2 * SECONDS_PER_HOUR },
      daylight: {
        designation: "-01",
        offsetSeconds: -SECONDS_PER_HOUR,
        start: monthWeekDay(3, 5, 0, -SECONDS_PER_HOUR),
        end: monthWeekDay(10, 5, 0, 0),
      },
    });
  });

  it("reads zero-based and Julian days with a time above 24 hours", () => {
    expect(parseFutureRule("EST5EDT,0/0,J365/25")?.daylight).toMatchObject({
      start: { kind: RuleDateKind.ZERO_BASED, day: 0, timeSeconds: 0 },
      end: {
        kind: RuleDateKind.JULIAN_NO_LEAP,
        day: 365,
        timeSeconds: 25 * SECONDS_PER_HOUR,
      },
    });
  });

  it.each([
    ["<+05>-5", "+05", 5 * SECONDS_PER_HOUR],
    ["<+0530>-5:30", "+0530", 5 * SECONDS_PER_HOUR + 30 * 60],
    ["<-0345>3:45:30", "-0345", -(3 * SECONDS_PER_HOUR + 45 * 60 + 30)],
  ])("reads the standard-only rule %s", (text, designation, offsetSeconds) => {
    expect(parseFutureRule(text)).toEqual({
      standard: { designation, offsetSeconds },
    });
  });

  it.each([
    ["STD3DST,J60/2,J61/2", RuleDateKind.JULIAN_NO_LEAP, 60, 61],
    ["STD3DST,59/2,60/2", RuleDateKind.ZERO_BASED, 59, 60],
  ])("reads the day kinds of %s", (text, kind, startDay, endDay) => {
    expect(parseFutureRule(text)?.daylight).toMatchObject({
      start: { kind, day: startDay, timeSeconds: DEFAULT_TIME_SECONDS },
      end: { kind, day: endDay, timeSeconds: DEFAULT_TIME_SECONDS },
    });
  });

  it("accepts the largest hour of a transition time", () => {
    expect(
      parseFutureRule("EST5EDT,M3.2.0/167:59:59,M11.1.0/-167:59:59")?.daylight,
    ).toMatchObject({
      start: { timeSeconds: 167 * SECONDS_PER_HOUR + 59 * 60 + 59 },
      end: { timeSeconds: -(167 * SECONDS_PER_HOUR + 59 * 60 + 59) },
    });
  });

  it.each([
    ["an hour of 168 in a transition time", "EST5EDT,M3.2.0/168,M11.1.0"],
    ["an hour of 168 in an offset", "<+05>-168"],
    ["a designation of two letters", "ES5EDT,M3.2.0,M11.1.0"],
    ["a daylight designation of two letters", "EST5ED,M3.2.0,M11.1.0"],
    ["a quoted designation of two characters", "<+5>-5"],
    ["a daylight designation without dates", "EST5EDT"],
    ["a month of 13", "EST5EDT,M13.1.0,M11.1.0"],
    ["a week of 6", "EST5EDT,M3.6.0,M11.1.0"],
    ["a weekday of 7", "EST5EDT,M3.2.7,M11.1.0"],
    ["a Julian day of 366", "EST5EDT,J366/2,M11.1.0"],
    ["a Julian day of 0", "EST5EDT,J0/2,M11.1.0"],
    ["a zero-based day of 366", "EST5EDT,366/2,M11.1.0"],
    ["a missing offset", "EST"],
    ["trailing text", "<+05>-5x"],
    ["an unclosed angle bracket", "<+05-5"],
    ["an empty text", ""],
  ])("rejects %s", (_description, text) => {
    expect(parseFutureRule(text)).toBeUndefined();
  });
});
