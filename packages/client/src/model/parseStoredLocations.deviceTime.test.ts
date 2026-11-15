// FR9, FR12 of add-locations-via-search: validating a stored payload (D4).
// Verifies FR8, FR9 of set-home-location-and-show-differences (D6): the home location id.
// Verifies FR7 of add-city-coordinates-to-locations (D6): optional coordinates.
import { describe, expect, it } from "vitest";
import { LocationKind } from "./locationKind";
import { parseStoredLocations } from "./parseStoredLocations";

const almaty = {
  timeZoneId: "Asia/Almaty",
  label: "Almaty",
  countryCode: "KZ",
};

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
