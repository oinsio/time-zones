// Verifies FR1, FR3 of show-city-labels-in-interface-language (D4).
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { fakeClock } from "@/lib/temporal";
import { buildDeviceTimeLocation } from "@/model";
import { HourFormat } from "@/preferences";
import { UNIT_TEST_DEVICE_TIME_ZONE } from "@/test/deviceTimeZone";
import { buildLocation } from "@/test/factories/buildLocation";
import { buildReferenceDay } from "@/test/referenceDay";
import { presentLocationRows } from "./presentLocationRows";

const instant = fakeClock("2026-07-15T12:00:00Z").instant();

const tokyoInRussian = buildLocation({
  label: "Токио",
  timeZoneId: "Asia/Tokyo",
  countryCode: "JP",
});

const present = (
  locations: Parameters<typeof presentLocationRows>[0],
  cityLabels?: ReadonlyMap<string, string>,
) =>
  presentLocationRows(locations, {
    language: "en",
    hourFormat: HourFormat.H24,
    instant,
    deviceTimeZoneId: UNIT_TEST_DEVICE_TIME_ZONE,
    homeLocationId: null,
    referenceOffsetMinutes: undefined,
    referenceDay: buildReferenceDay(instant, UNIT_TEST_DEVICE_TIME_ZONE),
    translate: i18n.getFixedT("en"),
    cityLabels,
  });

describe("present location rows with city labels", () => {
  it("should show the city label of the map instead of the stored label", () => {
    const [row] = present(
      [tokyoInRussian],
      new Map([[tokyoInRussian.id, "Tokyo"]]),
    );
    expect(row?.cityLabel).toBe("Tokyo");
  });

  it("should name the city in the wall time input label", () => {
    const [row] = present(
      [tokyoInRussian],
      new Map([[tokyoInRussian.id, "Tokyo"]]),
    );
    expect(row?.wallTimeInputLabel).toMatch(/^Enter time — Tokyo/);
  });

  it("should keep the stored label without a map", () => {
    expect(present([tokyoInRussian])[0]?.cityLabel).toBe("Токио");
  });

  it("should keep the stored label for an id missing from the map", () => {
    const [row] = present([tokyoInRussian], new Map([["other", "Tokyo"]]));
    expect(row?.cityLabel).toBe("Токио");
  });

  it("should ignore the map for the device time location", () => {
    const deviceTimeLocation = buildDeviceTimeLocation(
      UNIT_TEST_DEVICE_TIME_ZONE,
    );
    const [row] = present(
      [deviceTimeLocation],
      new Map([[deviceTimeLocation.id, "Tokyo"]]),
    );
    expect(row?.cityLabel).not.toBe("Tokyo");
  });
});
