// @add-remote-zone-rules-updates @FR5, M3: the order of zone rules release names
import { describe, expect, it } from "vitest";
import {
  compareReleaseNames,
  isNewerRelease,
  parseReleaseName,
} from "./releaseOrder.ts";

const ORDERED_PAIRS = [
  ["2026a", "2026b"],
  ["2026b", "2026z"],
  ["2026z", "2026aa"],
  ["2026aa", "2026ab"],
  ["2025z", "2026a"],
  ["2024a", "2026a"],
] as const;

describe("compareReleaseNames", () => {
  it.each(ORDERED_PAIRS)("should order %s before %s", (earlier, later) => {
    expect(compareReleaseNames(earlier, later)).toBeLessThan(0);
  });

  it.each(ORDERED_PAIRS)("should order %s after %s", (earlier, later) => {
    expect(compareReleaseNames(later, earlier)).toBeGreaterThan(0);
  });

  it.each(ORDERED_PAIRS.flat())("should equal %s to itself", (name) => {
    expect(compareReleaseNames(name, name)).toBe(0);
  });
});

describe("isNewerRelease", () => {
  it.each(ORDERED_PAIRS)("should find %s older than %s", (earlier, later) => {
    expect(isNewerRelease(later, earlier)).toBe(true);
    expect(isNewerRelease(earlier, later)).toBe(false);
  });

  it("should not find a release newer than itself", () => {
    expect(isNewerRelease("2026f", "2026f")).toBe(false);
  });
});

describe("parseReleaseName", () => {
  it("should read the year and the letters", () => {
    expect(parseReleaseName("2026aa")).toEqual({ year: 2026, letters: "aa" });
  });

  it.each(["2026", "2026A", "26a", "latest", "2026a ", "x2026a", ""])(
    "should find %j invalid",
    (name) => {
      expect(parseReleaseName(name)).toBeUndefined();
    },
  );
});
