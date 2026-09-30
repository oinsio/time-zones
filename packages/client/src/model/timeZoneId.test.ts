// FR9 of add-locations-via-search: canonical IANA identifiers (D2).
import { describe, expect, it } from "vitest";
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
