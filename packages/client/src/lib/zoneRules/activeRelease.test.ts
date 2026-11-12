// @add-remote-zone-rules-updates @FR6: which release is active at start
import { describe, expect, it } from "vitest";
import { chooseActiveRelease } from "./activeRelease.ts";
import type { ZoneRulesRelease } from "./core/index.ts";

const releaseNamed = (release: string): ZoneRulesRelease => ({
  release,
  zones: new Map(),
});
const bundled = releaseNamed("2026f");

describe("chooseActiveRelease", () => {
  it("should choose a stored release newer than the bundled one and keep it", () => {
    const stored = releaseNamed("2026g");
    expect(chooseActiveRelease({ bundled, stored })).toEqual({
      active: stored,
      shouldClearStored: false,
    });
  });

  it.each(["2026f", "2026e"])(
    "should choose the bundled release and clear a stored %s",
    (storedName) => {
      expect(
        chooseActiveRelease({ bundled, stored: releaseNamed(storedName) }),
      ).toEqual({ active: bundled, shouldClearStored: true });
    },
  );

  it("should choose the bundled release and clear nothing when nothing is stored", () => {
    expect(chooseActiveRelease({ bundled, stored: undefined })).toEqual({
      active: bundled,
      shouldClearStored: false,
    });
  });

  it("should choose a valid stored release when the bundled one is missing", () => {
    const stored = releaseNamed("2026e");
    expect(chooseActiveRelease({ bundled: undefined, stored })).toEqual({
      active: stored,
      shouldClearStored: false,
    });
  });

  it("should choose nothing when both are missing", () => {
    expect(
      chooseActiveRelease({ bundled: undefined, stored: undefined }),
    ).toEqual({ active: undefined, shouldClearStored: false });
  });
});
