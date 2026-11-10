// Verifies FR2 of add-grid-meeting-range-and-share.
import { describe, expect, it, vi } from "vitest";
import { Temporal } from "@/lib/temporal";
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

  it("should rethrow an error that is not a RangeError", () => {
    const failure = new TypeError("unexpected");
    vi.spyOn(Temporal.Instant, "from").mockImplementation(() => {
      throw failure;
    });
    expect(() => parseCommandInstant("2026-03-08T04:00:00Z")).toThrow(failure);
    vi.restoreAllMocks();
  });
});
