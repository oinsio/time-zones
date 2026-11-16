// Verifies FR7 of refresh-data-through-scheduled-pull-requests.
import { describe, expect, it } from "vitest";
import { compareZoneRules } from "../../../scripts/dataRefresh/compareZoneRules.ts";

const rule = { types: [] };
const committedRelease = {
  zones: { "Europe/Kyiv": rule, "Europe/Kiev": "Europe/Kyiv", "Asia/Almaty": rule },
};

describe("compareZoneRules", () => {
  it("lists an identifier missing as zone and as link", () => {
    const refreshed = { release: { zones: { "Asia/Almaty": rule, "Europe/Kiev": "Asia/Almaty" } } };
    expect(
      compareZoneRules({ release: committedRelease }, refreshed).removedZoneIds,
    ).toEqual(["Europe/Kyiv"]);
  });

  it("does not list an identifier that turned from a zone into a link", () => {
    const refreshed = {
      release: {
        zones: { "Europe/Kyiv": rule, "Europe/Kiev": "Europe/Kyiv", "Asia/Almaty": "Europe/Kyiv" },
      },
    };
    expect(
      compareZoneRules({ release: committedRelease }, refreshed).removedZoneIds,
    ).toEqual([]);
  });

  it("lists zones whose coordinates the refresh lacks", () => {
    const committed = { release: committedRelease, coordinates: { zones: { "Asia/Almaty": [1, 2], "Europe/Kyiv": [3, 4] } } };
    const refreshed = { release: committedRelease, coordinates: { zones: { "Europe/Kyiv": [3, 4] } } };
    expect(compareZoneRules(committed, refreshed).zonesWithoutCoordinates).toEqual(["Asia/Almaty"]);
  });

  it("gives no coordinate loss when the committed side has no coordinates file", () => {
    const refreshed = { release: committedRelease, coordinates: { zones: {} } };
    expect(
      compareZoneRules({ release: committedRelease }, refreshed).zonesWithoutCoordinates,
    ).toEqual([]);
  });

  it("gives no coordinate loss when the refreshed side has no coordinates file", () => {
    const committed = { release: committedRelease, coordinates: { zones: { "Asia/Almaty": [1, 2] } } };
    expect(
      compareZoneRules(committed, { release: committedRelease }).zonesWithoutCoordinates,
    ).toEqual([]);
  });
});
