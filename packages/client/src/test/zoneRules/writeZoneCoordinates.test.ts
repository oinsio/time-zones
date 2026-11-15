// Verifies FR2, FR3 of add-city-coordinates-to-locations (D3): the zone coordinates file writer.
import { describe, expect, it } from "vitest";
import { writeZoneCoordinates } from "../../../scripts/zoneRules/writeZoneCoordinates.ts";

const TABLE = new Map<string, [number, number]>([
  ["Europe/Moscow", [558, 376]],
  ["Africa/Abidjan", [53, -40]],
]);

describe("writeZoneCoordinates", () => {
  it("should name the release first, then one zone per line in alphabetical order", () => {
    const text = writeZoneCoordinates({
      release: "2026f",
      zones: TABLE,
      overrides: {},
    });
    expect(text).toBe(
      '{"release":"2026f","zones":{\n"Africa/Abidjan":[53,-40],\n"Europe/Moscow":[558,376]\n}}\n',
    );
  });

  it("should parse as the document of design D3", () => {
    const document = JSON.parse(
      writeZoneCoordinates({ release: "2026f", zones: TABLE, overrides: {} }),
    );
    expect(document).toEqual({
      release: "2026f",
      zones: { "Europe/Moscow": [558, 376], "Africa/Abidjan": [53, -40] },
    });
  });

  it("should write an override for a zone the table lacks", () => {
    const document = JSON.parse(
      writeZoneCoordinates({
        release: "2026f",
        zones: TABLE,
        overrides: { "Etc/Missing": [10, 20] },
      }),
    );
    expect(document.zones["Etc/Missing"]).toEqual([10, 20]);
  });

  it("should let an override win over the table", () => {
    const document = JSON.parse(
      writeZoneCoordinates({
        release: "2026f",
        zones: TABLE,
        overrides: { "Europe/Moscow": [1, 2] },
      }),
    );
    expect(document.zones["Europe/Moscow"]).toEqual([1, 2]);
  });

  it("should apply the committed overrides by default", () => {
    const document = JSON.parse(
      writeZoneCoordinates({ release: "2026f", zones: TABLE }),
    );
    expect(Object.keys(document.zones)).toHaveLength(TABLE.size);
  });
});
