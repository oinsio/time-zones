// FR9 of add-locations-via-search: canonical IANA identifiers (D2).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installZoneRulesDateTimeFormat } from "@/lib/zoneRules";
import {
  installStaleEngine,
  restoreEngine,
} from "@/test/fakeStaleDateTimeFormat";
import { committedRelease } from "@/test/installZoneRules";
import { canonicalizeTimeZoneId } from "./timeZoneId";

describe("canonicalizeTimeZoneId", () => {
  it.each([
    ["Asia/Calcutta", "Asia/Kolkata"],
    ["Europe/Kiev", "Europe/Kyiv"],
    ["europe/moscow", "Europe/Moscow"],
    ["Etc/UTC", "UTC"],
    ["Europe/Moscow", "Europe/Moscow"],
  ])("should canonicalize %s to %s", (input, expected) => {
    expect(canonicalizeTimeZoneId(input)).toBe(expected);
  });

  it.each(["+05:00", "-03:00", "−05:00", "Mars/Olympus_Mons", ""])(
    "should reject %j as not an IANA identifier",
    (input) => {
      expect(canonicalizeTimeZoneId(input)).toBeUndefined();
    },
  );
});

// FR3 of support-legacy-ios-12-safari: no BigInt at run time.
describe("canonicalizeTimeZoneId without BigInt", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ["Asia/Almaty", "Asia/Almaty"],
    ["Europe/Kiev", "Europe/Kyiv"],
  ])("should canonicalize %s to %s", (input, expected) => {
    vi.stubGlobal("BigInt", undefined);
    expect(canonicalizeTimeZoneId(input)).toBe(expected);
  });
});

// FR5 of add-zone-rules-from-iana: known zones come from the zone rules, not the engine.
describe("canonicalizeTimeZoneId on an engine that rejects renamed and new zones", () => {
  beforeEach(() => {
    installStaleEngine({
      staleZones: {},
      rejectedZones: ["America/Ciudad_Juarez", "Europe/Kyiv"],
    });
    installZoneRulesDateTimeFormat(committedRelease);
    vi.resetModules();
  });

  afterEach(() => {
    restoreEngine();
    vi.resetModules();
  });

  it.each([
    ["America/Ciudad_Juarez", "America/Ciudad_Juarez"],
    ["Europe/Kiev", "Europe/Kyiv"],
    ["Asia/Calcutta", "Asia/Kolkata"],
    ["Europe/Oslo", "Europe/Oslo"],
    ["Mars/Olympus_Mons", undefined],
  ])("should canonicalize %s to %s", async (input, expected) => {
    const model = await import("./timeZoneId");

    expect(model.canonicalizeTimeZoneId(input)).toBe(expected);
  });
});
