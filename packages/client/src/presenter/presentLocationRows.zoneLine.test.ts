// Verifies FR2, FR3, FR5, FR6, FR13 of show-zone-abbreviations-and-zone-label-setting (D5).
// Verifies FR3, FR4 of add-country-to-zone-label.
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { fakeClock } from "@/lib/temporal";
import type { InterfaceLanguageCode } from "@/locales";
import { buildDeviceTimeLocation } from "@/model";
import { HourFormat, ZoneLabelPart } from "@/preferences";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";
import { buildReferenceDay } from "@/test/referenceDay";
import { presentLocationRows } from "./presentLocationRows";
import { ZoneLinePartKind } from "./zoneLine";

const { UTC_OFFSET, ZONE_ABBREVIATION, COUNTRY } = ZoneLabelPart;
const july = fakeClock("2026-07-15T12:00:00Z").instant();
const january = fakeClock("2026-01-15T12:00:00Z").instant();

function present(
  cityLabels: readonly string[],
  {
    language = "en",
    zoneLabelParts = [UTC_OFFSET, ZONE_ABBREVIATION, COUNTRY],
    instant = july,
    deviceTimeZoneId = "Asia/Almaty",
    includeDeviceTime = false,
  }: {
    language?: InterfaceLanguageCode;
    zoneLabelParts?: readonly ZoneLabelPart[];
    instant?: typeof july;
    deviceTimeZoneId?: string;
    includeDeviceTime?: boolean;
  } = {},
) {
  const cityLocations = cityLabels.map((label) =>
    buildLocation({ ...KNOWN_CITIES[label], label }),
  );
  const locations = includeDeviceTime
    ? [buildDeviceTimeLocation(deviceTimeZoneId), ...cityLocations]
    : cityLocations;
  return presentLocationRows(locations, {
    language,
    hourFormat: HourFormat.H24,
    instant,
    deviceTimeZoneId,
    homeLocationId: null,
    referenceOffsetMinutes: undefined,
    referenceDay: buildReferenceDay(instant, deviceTimeZoneId),
    translate: i18n.getFixedT(language),
    zoneLabelParts,
  });
}

const texts = (row: ReturnType<typeof present>[number] | undefined) =>
  row?.zoneLineParts.map((part) => part.text);

describe("the zone line of a city row", () => {
  it("should read country, abbreviation and offset in Russian", () => {
    expect(texts(present(["Kolkata"], { language: "ru" })[0])).toEqual([
      "Индия",
      "IST",
      "UTC+5:30",
    ]);
  });

  it.each([
    [
      [UTC_OFFSET, ZONE_ABBREVIATION, COUNTRY],
      ["India", "IST", "UTC+5:30"],
    ],
    [
      [UTC_OFFSET, COUNTRY],
      ["India", "UTC+5:30"],
    ],
    [
      [ZONE_ABBREVIATION, COUNTRY],
      ["India", "IST"],
    ],
    [[COUNTRY], ["India"]],
    [[UTC_OFFSET], ["UTC+5:30"]],
    [[], []],
  ])("should follow the zone label %j", (zoneLabelParts, expected) => {
    expect(texts(present(["Kolkata"], { zoneLabelParts })[0])).toEqual(
      expected,
    );
  });

  it("should keep the country name of a row while the country is hidden", () => {
    const [row] = present(["Kolkata"], { zoneLabelParts: [UTC_OFFSET] });
    expect(row?.countryName).toBe("India");
  });

  it("should type the parts", () => {
    expect(
      present(["Kolkata"])[0]?.zoneLineParts.map((part) => part.kind),
    ).toEqual([
      ZoneLinePartKind.PLACE,
      ZoneLinePartKind.ZONE_ABBREVIATION,
      ZoneLinePartKind.UTC_OFFSET,
    ]);
  });

  it("should leave a zone without an abbreviation with country and offset", () => {
    expect(texts(present(["Almaty"])[0])).toEqual(["Kazakhstan", "UTC+5"]);
  });

  it("should show the UTC zone once", () => {
    expect(texts(present(["UTC"])[0])).toEqual(["UTC"]);
  });

  it("should show the UTC zone abbreviation when the offset is hidden", () => {
    expect(
      texts(present(["UTC"], { zoneLabelParts: [ZONE_ABBREVIATION] })[0]),
    ).toEqual(["UTC"]);
  });

  it("should write МСК for Moscow in Russian and MSK in English", () => {
    expect(texts(present(["Moscow"], { language: "ru" })[0])).toEqual([
      "Россия",
      "МСК",
      "UTC+3",
    ]);
    expect(texts(present(["Moscow"])[0])).toEqual(["Russia", "MSK", "UTC+3"]);
  });

  it.each([
    [january, ["EST", "GMT"]],
    [july, ["EDT", "IST"]],
  ])("should follow the reference moment", (instant, expected) => {
    const rows = present(["New York", "Dublin"], { instant });
    expect(rows.map((row) => row.zoneLineParts[1]?.text)).toEqual(expected);
  });
});

describe("the zone line of the device time row", () => {
  it.each([
    [
      [UTC_OFFSET, ZONE_ABBREVIATION],
      "ru",
      ["Время устройства", "МСК", "UTC+3"],
    ],
    [[UTC_OFFSET], "ru", ["Время устройства", "UTC+3"]],
    [[ZONE_ABBREVIATION], "ru", ["Время устройства", "МСК"]],
    [[], "ru", ["Время устройства"]],
    [[UTC_OFFSET, ZONE_ABBREVIATION], "en", ["Device time", "MSK", "UTC+3"]],
  ] as const)(
    "should read %j in %s as %j",
    (zoneLabelParts, language, expected) => {
      const [row] = present([], {
        language,
        zoneLabelParts,
        includeDeviceTime: true,
        deviceTimeZoneId: "Europe/Moscow",
      });
      expect(texts(row)).toEqual(expected);
    },
  );

  it("should keep Device time as the first part while the country is hidden", () => {
    const [row] = present(["Kolkata"], {
      zoneLabelParts: [UTC_OFFSET],
      includeDeviceTime: true,
    });
    expect(texts(row)).toEqual(["Device time", "UTC+5"]);
  });

  it("should have no abbreviation for Almaty", () => {
    const [row] = present([], { includeDeviceTime: true });
    expect(texts(row)).toEqual(["Device time", "UTC+5"]);
  });

  it("should have no meta label any more", () => {
    const [row] = present([], { includeDeviceTime: true });
    expect(row).not.toHaveProperty("metaLabel");
  });
});
