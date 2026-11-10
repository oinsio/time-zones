// Verifies FR2 of add-grid-meeting-range-and-share.
import { describe, expect, it } from "vitest";
import { parseCommandInstant } from "./commandInstant";

describe("parseCommandInstant", () => {
  it("should parse an instant with the Z suffix", () => {
    expect(parseCommandInstant("2026-03-08T04:00:00Z")?.toString()).toBe(
      "2026-03-08T04:00:00Z",
    );
  });

  it.each([
    ["an offset instead of Z", "2026-03-08T04:00:00+00:00"],
    ["no designator", "2026-03-08T04:00:00"],
    ["garbage ending in Z", "notaninstantZ"],
    ["an empty text", ""],
  ])("should return undefined for %s", (_name, text) => {
    expect(parseCommandInstant(text)).toBeUndefined();
  });
});
