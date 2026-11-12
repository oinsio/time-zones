// Verifies FR8 of add-remote-zone-rules-updates: the settings line names the installed release.
import { renderHook } from "@testing-library/react";
import i18n from "i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as zoneRules from "@/lib/zoneRules";
import { useZoneRulesRelease } from "./useZoneRulesRelease";

afterEach(async () => {
  vi.restoreAllMocks();
  await i18n.changeLanguage("ru");
});

describe("useZoneRulesRelease", () => {
  it("should present the installed release", async () => {
    await i18n.changeLanguage("en");
    vi.spyOn(zoneRules, "getInstalledRelease").mockReturnValue({
      release: "2026g",
      zones: new Map(),
    });
    expect(renderHook(() => useZoneRulesRelease()).result.current).toBe(
      "Time zone rules: 2026g",
    );
  });

  it("should present nothing without an installed release", () => {
    vi.spyOn(zoneRules, "getInstalledRelease").mockReturnValue(undefined);
    expect(
      renderHook(() => useZoneRulesRelease()).result.current,
    ).toBeUndefined();
  });
});
