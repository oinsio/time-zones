// Verifies FR10, UX4 of add-locations-via-search (D9).
import { describe, expect, it } from "vitest";
import { buildLocation } from "@/test/factories/buildLocation";
import { presentLocationRows } from "./presentLocationRows";

describe("present location rows", () => {
  it("should keep the list order and show the city label", () => {
    const rows = presentLocationRows(
      [
        buildLocation({
          label: "Almaty",
          timeZoneId: "Asia/Almaty",
          countryCode: "KZ",
        }),
        buildLocation(),
      ],
      "en",
    );
    expect(rows.map((row) => row.cityLabel)).toEqual(["Almaty", "Moscow"]);
  });

  it("should carry the location id", () => {
    const location = buildLocation();
    expect(presentLocationRows([location], "en")[0]?.id).toBe(location.id);
  });

  it.each([
    ["en", "KZ", "Kazakhstan"],
    ["ru", "RU", "Россия"],
    ["en", "RU", "Russia"],
  ] as const)(
    "should name the country in %s for %s",
    (language, countryCode, expected) => {
      const rows = presentLocationRows(
        [buildLocation({ countryCode })],
        language,
      );
      expect(rows[0]?.countryName).toBe(expected);
    },
  );

  it("should give an empty country name for an empty code", () => {
    const rows = presentLocationRows(
      [buildLocation({ label: "UTC", timeZoneId: "UTC", countryCode: "" })],
      "en",
    );
    expect(rows[0]?.countryName).toBe("");
  });

  it("should give an empty country name for a code Intl does not know", () => {
    const rows = presentLocationRows(
      [buildLocation({ countryCode: "QQ" })],
      "en",
    );
    expect(rows[0]?.countryName).toBe("");
  });
});
