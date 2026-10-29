// FR5 of support-legacy-ios-12-safari: no country name without Intl.DisplayNames.
import { afterEach, describe, expect, it, vi } from "vitest";
import { presentCountryName } from "./countryName";

describe("presentCountryName", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should give the country name when Intl.DisplayNames exists", () => {
    expect(presentCountryName("KZ", "en")).toBe("Kazakhstan");
  });

  it("should give an empty name without throwing when Intl.DisplayNames is missing", () => {
    vi.stubGlobal("Intl", { ...Intl, DisplayNames: undefined });

    expect(presentCountryName("KZ", "en")).toBe("");
  });
});
