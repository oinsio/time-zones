// FR3 of add-zone-rules-from-iana: evaluating the future rule at an instant
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { type FutureRule, parseFutureRule } from "./futureRule.ts";
import { resolveFutureRule } from "./futureRuleOffset.ts";

const SECONDS_PER_HOUR = 3600;
const MILLISECONDS_PER_SECOND = 1000;

function readRule(text: string): FutureRule {
  const rule = parseFutureRule(text);
  if (!rule) throw new Error(`Test rule does not parse: ${text}`);
  return rule;
}

function toEpochSeconds(isoInstant: string): number {
  return (
    Temporal.Instant.from(isoInstant).epochMilliseconds /
    MILLISECONDS_PER_SECOND
  );
}

function resolveAt(ruleText: string, isoInstant: string) {
  const type = resolveFutureRule(
    readRule(ruleText),
    toEpochSeconds(isoInstant),
  );
  return {
    offsetHours: type.utcOffsetSeconds / SECONDS_PER_HOUR,
    designation: type.designation,
  };
}

const NEW_YORK_RULE = "EST5EDT,M3.2.0,M11.1.0";
const DUBLIN_RULE = "IST-1GMT0,M10.5.0,M3.5.0/1";
const NUUK_RULE = "<-02>2<-01>,M3.5.0/-1,M10.5.0/0";
const SYDNEY_RULE = "AEST-10AEDT,M10.1.0,M4.1.0/3";
const WHOLE_YEAR_RULE = "EST5EDT,0/0,J365/25";

describe("resolveFutureRule", () => {
  it.each([
    [NEW_YORK_RULE, "2040-07-15T12:00:00Z", -4, "EDT"],
    [NEW_YORK_RULE, "2040-01-15T12:00:00Z", -5, "EST"],
    [DUBLIN_RULE, "2038-07-01T12:00:00Z", 1, "IST"],
    [DUBLIN_RULE, "2038-01-15T12:00:00Z", 0, "GMT"],
    [NUUK_RULE, "2040-07-15T12:00:00Z", -1, "-01"],
    [NUUK_RULE, "2040-01-15T12:00:00Z", -2, "-02"],
    [WHOLE_YEAR_RULE, "2040-01-15T12:00:00Z", -4, "EDT"],
    [WHOLE_YEAR_RULE, "2040-07-15T12:00:00Z", -4, "EDT"],
    ["<+05>-5", "2040-07-15T12:00:00Z", 5, "+05"],
    ["NZST-12NZDT,M9.5.0,M4.1.0/3", "2040-01-15T12:00:00Z", 13, "NZDT"],
    [SYDNEY_RULE, "2040-03-31T15:30:00Z", 11, "AEDT"],
    [SYDNEY_RULE, "2040-03-31T16:30:00Z", 10, "AEST"],
  ])(
    "reads %s at %s as %d %s",
    (ruleText, isoInstant, offsetHours, designation) => {
      expect(resolveAt(ruleText, isoInstant)).toEqual({
        offsetHours,
        designation,
      });
    },
  );

  it("reads <+0530>-5:30 as a half-hour offset", () => {
    const type = resolveFutureRule(
      readRule("<+0530>-5:30"),
      toEpochSeconds("2040-07-15T12:00:00Z"),
    );
    expect(type).toEqual({
      utcOffsetSeconds: 19800,
      designation: "+0530",
      isDaylightSavingTime: false,
    });
  });

  it("flags the daylight type as daylight saving time and the standard type as not", () => {
    const summer = resolveFutureRule(
      readRule(NEW_YORK_RULE),
      toEpochSeconds("2040-07-15T12:00:00Z"),
    );
    const winter = resolveFutureRule(
      readRule(NEW_YORK_RULE),
      toEpochSeconds("2040-01-15T12:00:00Z"),
    );
    expect([summer.isDaylightSavingTime, winter.isDaylightSavingTime]).toEqual([
      true,
      false,
    ]);
  });

  it("reads a transition in the local time in force before it", () => {
    expect(resolveAt(NEW_YORK_RULE, "2040-03-11T06:59:59Z").offsetHours).toBe(
      -5,
    );
    expect(resolveAt(NEW_YORK_RULE, "2040-03-11T07:00:00Z").offsetHours).toBe(
      -4,
    );
    expect(resolveAt(NEW_YORK_RULE, "2040-11-04T05:59:59Z").offsetHours).toBe(
      -4,
    );
    expect(resolveAt(NEW_YORK_RULE, "2040-11-04T06:00:00Z").offsetHours).toBe(
      -5,
    );
  });

  it("reads Nuuk's transition one hour before midnight local time", () => {
    expect(resolveAt(NUUK_RULE, "2040-03-25T00:59:59Z").offsetHours).toBe(-2);
    expect(resolveAt(NUUK_RULE, "2040-03-25T01:00:00Z").offsetHours).toBe(-1);
  });

  it("keeps Dublin's daylight saving time from October on to March", () => {
    expect(resolveAt(DUBLIN_RULE, "2038-10-31T00:59:59Z").designation).toBe(
      "IST",
    );
    expect(resolveAt(DUBLIN_RULE, "2038-10-31T01:00:00Z").designation).toBe(
      "GMT",
    );
    expect(resolveAt(DUBLIN_RULE, "2038-03-28T00:59:59Z").designation).toBe(
      "GMT",
    );
    expect(resolveAt(DUBLIN_RULE, "2038-03-28T01:00:00Z").designation).toBe(
      "IST",
    );
  });

  it.each([
    ["2040-12-31T12:00:00Z"],
    ["2041-01-01T12:00:00Z"],
    ["2040-12-31T23:59:59Z"],
    ["2041-01-01T00:00:00Z"],
  ])(
    "keeps a rule covering the whole year in daylight saving time at %s",
    (isoInstant) => {
      expect(resolveAt(WHOLE_YEAR_RULE, isoInstant)).toEqual({
        offsetHours: -4,
        designation: "EDT",
      });
    },
  );

  it.each([
    ["2040-12-31T12:00:00Z", 11],
    ["2041-01-01T12:00:00Z", 11],
    ["2041-07-01T12:00:00Z", 10],
  ])(
    "reads Sydney across the year boundary at %s",
    (isoInstant, offsetHours) => {
      expect(resolveAt(SYDNEY_RULE, isoInstant).offsetHours).toBe(offsetHours);
    },
  );

  it.each([
    ["2100-07-15T12:00:00Z", "EDT"],
    ["2100-01-15T12:00:00Z", "EST"],
    ["2100-03-14T06:59:59Z", "EST"],
    ["2100-03-14T07:00:00Z", "EDT"],
  ])("keeps the rule going past 2037: %s is %s", (isoInstant, designation) => {
    expect(resolveAt(NEW_YORK_RULE, isoInstant).designation).toBe(designation);
  });

  it.each([
    ["STD3DST,J60/2,J61/2", "2040-02-29T12:00:00Z", -3],
    ["STD3DST,J60/2,J61/2", "2040-03-01T12:00:00Z", -2],
    ["STD3DST,59/2,60/2", "2040-02-29T12:00:00Z", -2],
    ["STD3DST,59/2,60/2", "2040-02-28T12:00:00Z", -3],
    ["STD3DST,59/2,60/2", "2040-03-01T12:00:00Z", -3],
    ["STD3DST,J60/2,J61/2", "2041-03-01T12:00:00Z", -2],
    ["STD3DST,J60/2,J61/2", "2041-02-28T12:00:00Z", -3],
    ["STD3DST,J59/2,J61/2", "2040-02-28T12:00:00Z", -2],
  ])(
    "reads the Julian day form %s at %s as %d",
    (ruleText, isoInstant, offsetHours) => {
      expect(resolveAt(ruleText, isoInstant).offsetHours).toBe(offsetHours);
    },
  );

  it("answers a repeated lookup with the same type", () => {
    const rule = readRule(NEW_YORK_RULE);
    const instant = toEpochSeconds("2040-07-15T12:00:00Z");
    expect(resolveFutureRule(rule, instant)).toBe(
      resolveFutureRule(rule, instant),
    );
  });
});
