// FR4 of add-zone-rules-from-iana: the local time type at an instant

import zoneRulesDocument from "virtual:zone-rules";
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { getLocalTimeType } from "./localTimeType.ts";
import {
  parseZoneRulesRelease,
  type ZoneRules,
  ZoneRulesReleaseError,
} from "./zoneRulesRelease.ts";

const SECONDS_PER_HOUR = 3600;
const MILLISECONDS_PER_SECOND = 1000;

const release = parseZoneRulesRelease(zoneRulesDocument);
if (release instanceof ZoneRulesReleaseError) throw release;
const zonesById = release.zones;

function getZoneRules(zoneId: string): ZoneRules {
  const zoneRules = zonesById.get(zoneId);
  if (!zoneRules) throw new Error(`The fixture release lacks ${zoneId}`);
  return zoneRules;
}

function readLocalTimeType(zoneId: string, isoInstant: string) {
  const epochSeconds =
    Temporal.Instant.from(isoInstant).epochMilliseconds /
    MILLISECONDS_PER_SECOND;
  const type = getLocalTimeType(getZoneRules(zoneId), epochSeconds);
  return {
    offsetHours: type.utcOffsetSeconds / SECONDS_PER_HOUR,
    designation: type.designation,
  };
}

describe("getLocalTimeType", () => {
  it.each([
    ["America/New_York", "1999-07-15T12:00:00Z", -5, "EST"],
    ["America/New_York", "2006-07-15T12:00:00Z", -4, "EDT"],
    ["America/New_York", "2026-03-08T06:59:59Z", -5, "EST"],
    ["America/New_York", "2026-03-08T07:00:00Z", -4, "EDT"],
    ["America/New_York", "2040-07-15T12:00:00Z", -4, "EDT"],
    ["Asia/Almaty", "2024-02-29T17:59:59Z", 6, "+06"],
    ["Asia/Almaty", "2024-02-29T18:00:00Z", 5, "+05"],
    ["Asia/Almaty", "2040-07-15T12:00:00Z", 5, "+05"],
    ["Europe/Dublin", "2040-07-15T12:00:00Z", 1, "IST"],
    ["America/Ciudad_Juarez", "2026-07-15T12:00:00Z", -6, "MDT"],
    ["UTC", "2026-07-15T12:00:00Z", 0, "UTC"],
  ])(
    "reads %s at %s as %d %s",
    (zoneId, isoInstant, offsetHours, designation) => {
      expect(readLocalTimeType(zoneId, isoInstant)).toEqual({
        offsetHours,
        designation,
      });
    },
  );

  it("holds the cutoff type before the cutoff", () => {
    expect(readLocalTimeType("Europe/Moscow", "1995-07-15T12:00:00Z")).toEqual({
      offsetHours: 3,
      designation: "MSK",
    });
  });

  it("holds the cutoff type of a zone without changes before the cutoff, whatever its future rule says", () => {
    expect(readLocalTimeType("Europe/Dublin", "1999-07-15T12:00:00Z")).toEqual({
      offsetHours: 0,
      designation: "GMT",
    });
  });

  it("reads the future rule from the cutoff on when the zone lists no change", () => {
    expect(readLocalTimeType("Europe/Dublin", "2000-01-01T00:00:00Z")).toEqual({
      offsetHours: 0,
      designation: "GMT",
    });
  });

  it("reads the type of the change at the very instant of the change", () => {
    expect(readLocalTimeType("Europe/Moscow", "2011-03-26T23:00:00Z")).toEqual({
      offsetHours: 4,
      designation: "MSK",
    });
  });

  it("holds the type after the last change forever when the zone has no future rule", () => {
    const zoneRules: ZoneRules = {
      ...getZoneRules("Asia/Almaty"),
      futureRule: undefined,
    };
    const type = getLocalTimeType(zoneRules, 4_000_000_000);
    expect(type.designation).toBe("+05");
  });

  it("holds the cutoff type for a zone with no changes and no future rule", () => {
    const zoneRules: ZoneRules = {
      ...getZoneRules("UTC"),
      futureRule: undefined,
    };
    expect(getLocalTimeType(zoneRules, 4_000_000_000).designation).toBe("UTC");
  });
});
