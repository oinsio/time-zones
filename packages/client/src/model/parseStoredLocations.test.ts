// FR9, FR12 of add-locations-via-search: validating a stored payload (D4).
// Verifies FR8, FR9 of set-home-location-and-show-differences (D6): the home location id.
import { describe, expect, it } from "vitest";
import { LocationKind } from "./locationKind";
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
      homeLocationId: null,
      locations: [
        { id: "Asia/Almaty|Almaty", kind: LocationKind.CITY, ...almaty },
        {
          id: "Europe/Moscow|Moscow",
          kind: LocationKind.CITY,
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
      homeLocationId: null,
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

  it.each(["Kazakhstan", "K", "kz", "<b>"])(
    "should reject the document for the country code %s",
    (countryCode) => {
      const outcome = parseStoredLocations({
        locations: [{ ...almaty, countryCode }],
      });
      expect(outcome).toEqual({ ok: false });
    },
  );

  it("should accept an empty country code", () => {
    const outcome = parseStoredLocations({
      locations: [{ ...almaty, countryCode: "" }],
    });
    expect(outcome).toMatchObject({ ok: true });
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

  describe("homeLocationId", () => {
    const withHome = (homeLocationId: unknown) =>
      parseStoredLocations({ locations: [almaty], homeLocationId });

    it("should read a string that names a listed location", () => {
      expect(withHome("Asia/Almaty|Almaty")).toMatchObject({
        ok: true,
        homeLocationId: "Asia/Almaty|Almaty",
      });
    });

    it("should read null as no home", () => {
      expect(withHome(null)).toMatchObject({ ok: true, homeLocationId: null });
    });

    it("should read a missing home as no home", () => {
      expect(parseStoredLocations({ locations: [almaty] })).toMatchObject({
        ok: true,
        homeLocationId: null,
      });
    });

    it.each([1, true, {}, []])("should reject home %j", (homeLocationId) => {
      expect(withHome(homeLocationId)).toEqual({ ok: false });
    });

    it("should canonicalize the id of a legacy zone", () => {
      const outcome = parseStoredLocations({
        locations: [{ ...almaty, timeZoneId: "Europe/Kiev", label: "Kyiv" }],
        homeLocationId: "Europe/Kiev|Kyiv",
      });

      expect(outcome).toMatchObject({
        ok: true,
        homeLocationId: "Europe/Kyiv|Kyiv",
      });
    });

    it.each(["Asia/Tokyo|Tokyo", "Mars/Base|Base", ""])(
      "should clear a home that points to %j",
      (homeLocationId) => {
        expect(withHome(homeLocationId)).toMatchObject({
          ok: true,
          homeLocationId: null,
        });
      },
    );
  });
});

// Verifies FR13, FR14 of add-settings-page-and-device-time-location (D2).
describe("parseStoredLocations device time location", () => {
  it("should load a DEVICE_TIME entry as the device time location", () => {
    const outcome = parseStoredLocations({
      locations: [{ kind: "DEVICE_TIME" }, { kind: "CITY", ...almaty }],
      homeLocationId: "device-time",
    });
    expect(outcome).toMatchObject({
      ok: true,
      homeLocationId: "device-time",
      locations: [
        { id: "device-time", kind: LocationKind.DEVICE_TIME },
        { id: "Asia/Almaty|Almaty", kind: LocationKind.CITY },
      ],
    });
  });

  it("should drop the home id of a device time location that is not listed", () => {
    const outcome = parseStoredLocations({
      locations: [almaty],
      homeLocationId: "device-time",
    });
    expect(outcome).toMatchObject({ ok: true, homeLocationId: null });
  });

  it.each([
    [
      "a second DEVICE_TIME entry",
      [{ kind: "DEVICE_TIME" }, { kind: "DEVICE_TIME" }],
    ],
    ["an unknown kind", [{ kind: "PLANET", ...almaty }]],
    [
      "a DEVICE_TIME entry with a zone",
      [{ kind: "DEVICE_TIME", timeZoneId: "Asia/Almaty" }],
    ],
    ["a DEVICE_TIME entry with a label", [{ kind: "DEVICE_TIME", label: "x" }]],
    [
      "a DEVICE_TIME entry with a country code",
      [{ kind: "DEVICE_TIME", countryCode: "KZ" }],
    ],
  ])("should reject %s", (_name, locations) => {
    expect(parseStoredLocations({ locations })).toEqual({ ok: false });
  });

  it("should load an empty list", () => {
    expect(parseStoredLocations({ locations: [] })).toMatchObject({
      ok: true,
      locations: [],
    });
  });
});
