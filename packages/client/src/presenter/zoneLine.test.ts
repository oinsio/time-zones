// Verifies FR5, FR13, FR14 of show-zone-abbreviations-and-zone-label-setting (D5).
// Verifies FR3, FR4, FR5 of add-country-to-zone-label.
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { ZoneLabelPart } from "@/preferences";
import {
  presentZoneLabelExample,
  presentZoneLine,
  ZoneLinePartKind,
} from "./zoneLine";

const { UTC_OFFSET, ZONE_ABBREVIATION, COUNTRY } = ZoneLabelPart;
const ALL_PARTS = [COUNTRY, ZONE_ABBREVIATION, UTC_OFFSET];
const JULY_INSTANT = Temporal.Instant.from("2026-07-15T12:00:00Z");

function line(overrides: Partial<Parameters<typeof presentZoneLine>[0]> = {}) {
  return presentZoneLine({
    placeText: "India",
    zoneAbbreviationLabel: "IST",
    utcOffsetLabel: "UTC+5:30",
    zoneLabelParts: ALL_PARTS,
    isDeviceTimeMeta: false,
    ...overrides,
  });
}

const texts = (parts: ReturnType<typeof presentZoneLine>) =>
  parts.map((part) => part.text);

describe("presentZoneLine", () => {
  it.each([
    [
      [COUNTRY, ZONE_ABBREVIATION, UTC_OFFSET],
      ["India", "IST", "UTC+5:30"],
    ],
    [
      [COUNTRY, UTC_OFFSET],
      ["India", "UTC+5:30"],
    ],
    [
      [COUNTRY, ZONE_ABBREVIATION],
      ["India", "IST"],
    ],
    [[COUNTRY], ["India"]],
    [
      [ZONE_ABBREVIATION, UTC_OFFSET],
      ["IST", "UTC+5:30"],
    ],
    [[UTC_OFFSET], ["UTC+5:30"]],
    [[ZONE_ABBREVIATION], ["IST"]],
    [[], []],
  ])("shows %j as %j", (zoneLabelParts, expected) => {
    expect(texts(line({ zoneLabelParts }))).toEqual(expected);
  });

  it("types the parts in order", () => {
    expect(line().map((part) => part.kind)).toEqual([
      ZoneLinePartKind.PLACE,
      ZoneLinePartKind.ZONE_ABBREVIATION,
      ZoneLinePartKind.UTC_OFFSET,
    ]);
  });

  it.each([
    ["an empty place", { placeText: "" }, ["IST", "UTC+5:30"]],
    [
      "an empty abbreviation",
      { zoneAbbreviationLabel: "" },
      ["India", "UTC+5:30"],
    ],
    ["an empty offset", { utcOffsetLabel: "" }, ["India", "IST"]],
  ])("leaves no part for %s", (_name, overrides, expected) => {
    expect(texts(line(overrides))).toEqual(expected);
  });

  it("shows the UTC zone once when both parts are shown", () => {
    const parts = line({
      placeText: "",
      zoneAbbreviationLabel: "UTC",
      utcOffsetLabel: "UTC",
    });
    expect(parts).toEqual([{ kind: ZoneLinePartKind.UTC_OFFSET, text: "UTC" }]);
  });

  it("shows the UTC zone abbreviation when the offset is hidden", () => {
    const parts = line({
      placeText: "",
      zoneAbbreviationLabel: "UTC",
      utcOffsetLabel: "UTC",
      zoneLabelParts: [ZONE_ABBREVIATION],
    });
    expect(parts).toEqual([
      { kind: ZoneLinePartKind.ZONE_ABBREVIATION, text: "UTC" },
    ]);
  });
});

describe("presentZoneLine on the device time location", () => {
  it.each([
    [
      [COUNTRY, ZONE_ABBREVIATION, UTC_OFFSET],
      ["Device time", "IST", "UTC+5:30"],
    ],
    [
      [COUNTRY, UTC_OFFSET],
      ["Device time", "UTC+5:30"],
    ],
    [
      [COUNTRY, ZONE_ABBREVIATION],
      ["Device time", "IST"],
    ],
    [[COUNTRY], ["Device time"]],
    [
      [ZONE_ABBREVIATION, UTC_OFFSET],
      ["Device time", "IST", "UTC+5:30"],
    ],
    [[UTC_OFFSET], ["Device time", "UTC+5:30"]],
    [[ZONE_ABBREVIATION], ["Device time", "IST"]],
    [[], ["Device time"]],
  ])("keeps Device time with %j", (zoneLabelParts, expected) => {
    expect(
      texts(
        line({
          placeText: "Device time",
          isDeviceTimeMeta: true,
          zoneLabelParts,
        }),
      ),
    ).toEqual(expected);
  });
});

describe("presentZoneLabelExample", () => {
  it.each([
    ["en", ["Russia", "MSK", "UTC+3"]],
    ["ru", ["Россия", "МСК", "UTC+3"]],
  ])("gives the example in %s", (language, expected) => {
    const parts = presentZoneLabelExample({
      instant: JULY_INSTANT,
      language,
      translate: i18n.getFixedT(language),
      zoneLabelParts: ALL_PARTS,
    });
    expect(texts(parts)).toEqual(expected);
  });

  it("follows the zone label parts", () => {
    const parts = presentZoneLabelExample({
      instant: JULY_INSTANT,
      language: "en",
      translate: i18n.getFixedT("en"),
      zoneLabelParts: [],
    });
    expect(texts(parts)).toEqual([]);
  });

  it("hides the country when it is off", () => {
    const parts = presentZoneLabelExample({
      instant: JULY_INSTANT,
      language: "en",
      translate: i18n.getFixedT("en"),
      zoneLabelParts: [ZONE_ABBREVIATION, UTC_OFFSET],
    });
    expect(texts(parts)).toEqual(["MSK", "UTC+3"]);
  });
});

describe("presentZoneLine order", () => {
  it("should follow ZONE_LABEL_PART_ORDER for the zone parts", () => {
    const kinds = line({
      zoneLabelParts: [ZONE_ABBREVIATION, UTC_OFFSET, COUNTRY],
    }).map((part) => part.kind);
    expect(kinds).toEqual([
      ZoneLinePartKind.PLACE,
      ZoneLinePartKind.ZONE_ABBREVIATION,
      ZoneLinePartKind.UTC_OFFSET,
    ]);
  });
});
