// Verifies FR4, M2, M3 of add-city-coordinates-to-locations: the committed zone coordinates.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ZONE_COORDINATES_FILE,
  ZONE_RULES_RELEASE_FILE,
} from "../../../app.config";
import { loadZoneData } from "../../../scripts/zoneData/loadZoneData.ts";
import { checkZoneCoordinates } from "../../../scripts/zoneRules/checkZoneCoordinates.ts";

const coordinatesText = readFileSync(ZONE_COORDINATES_FILE, "utf8");
const bundledRelease = JSON.parse(readFileSync(ZONE_RULES_RELEASE_FILE, "utf8"))
  .release as string;

describe("the committed zone coordinates", () => {
  it("should pass the check against the bundled release and the zone cities", () => {
    expect(
      checkZoneCoordinates(
        coordinatesText,
        bundledRelease,
        loadZoneData().zoneCities,
      ),
    ).toEqual([]);
  });

  it.each([
    ["Europe/Moscow", [558, 376]],
    ["Asia/Almaty", [433, 770]],
    ["America/New_York", [407, -740]],
    ["Australia/Sydney", [-339, 1512]],
    ["Atlantic/Reykjavik", [642, -218]],
    ["Pacific/Auckland", [-369, 1748]],
    ["Pacific/Honolulu", [213, -1579]],
  ])("should hold exactly the coordinates of %s", (zoneId, tenths) => {
    expect(JSON.parse(coordinatesText).zones[zoneId]).toEqual(tenths);
  });

  it("should hold no entry for UTC", () => {
    expect(JSON.parse(coordinatesText).zones).not.toHaveProperty("UTC");
  });
});
