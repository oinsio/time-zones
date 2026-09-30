// FR9, FR12 of add-locations-via-search: validating a stored payload (D4).
import { describe, expect, it } from "vitest";
import { parseStoredLocations } from "./parseStoredLocations";

const almaty = {
  timeZoneId: "Asia/Almaty",
  label: "Almaty",
  countryCode: "KZ",
};

describe("parseStoredLocations", () => {
  it("should accept a valid payload and derive ids in order", () => {
    const outcome = parseStoredLocations({
      locations: [
        almaty,
        { timeZoneId: "Europe/Moscow", label: "Moscow", countryCode: "RU" },
      ],
    });
    expect(outcome).toEqual({
      ok: true,
      locations: [
        { id: "Asia/Almaty|Almaty", ...almaty },
        {
          id: "Europe/Moscow|Moscow",
          timeZoneId: "Europe/Moscow",
          label: "Moscow",
          countryCode: "RU",
        },
      ],
    });
  });

  it("should accept an empty list", () => {
    expect(parseStoredLocations({ locations: [] })).toEqual({
      ok: true,
      locations: [],
    });
  });

  it("should canonicalize a legacy identifier", () => {
    const outcome = parseStoredLocations({
      locations: [{ ...almaty, timeZoneId: "Asia/Calcutta", label: "Kolkata" }],
    });
    expect(outcome).toMatchObject({
      ok: true,
      locations: [{ timeZoneId: "Asia/Kolkata", id: "Asia/Kolkata|Kolkata" }],
    });
  });

  it.each(["+05:00", "Mars/Olympus_Mons"])(
    "should reject the whole document for the identifier %s",
    (timeZoneId) => {
      const outcome = parseStoredLocations({
        locations: [almaty, { ...almaty, timeZoneId }],
      });
      expect(outcome).toEqual({ ok: false });
    },
  );

  it.each([
    ["null", null],
    ["a string", "text"],
    ["an array", []],
    ["no locations key", {}],
    [
      "an array carrying a locations property",
      Object.assign([], { locations: [] }),
    ],
    ["locations not an array", { locations: "x" }],
    ["an entry that is not an object", { locations: [1] }],
    ["an entry that is null", { locations: [null] }],
    [
      "a missing label",
      { locations: [{ timeZoneId: "UTC", countryCode: "" }] },
    ],
    ["a non-string label", { locations: [{ ...almaty, label: 1 }] }],
    [
      "a missing country code",
      { locations: [{ timeZoneId: "UTC", label: "UTC" }] },
    ],
    ["a non-string zone", { locations: [{ ...almaty, timeZoneId: 5 }] }],
  ])("should reject a payload with %s", (_description, payload) => {
    expect(parseStoredLocations(payload)).toEqual({ ok: false });
  });

  it("should drop an entry that became a duplicate only through canonicalization", () => {
    const kyiv = {
      timeZoneId: "Europe/Kyiv",
      label: "Kyiv",
      countryCode: "UA",
    };
    const outcome = parseStoredLocations({
      locations: [kyiv, { ...kyiv, timeZoneId: "Europe/Kiev" }],
    });
    expect(outcome).toMatchObject({
      ok: true,
      locations: [{ id: "Europe/Kyiv|Kyiv" }],
    });
    expect(outcome.ok && outcome.locations).toHaveLength(1);
  });
});
