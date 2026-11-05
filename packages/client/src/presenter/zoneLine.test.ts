// Verifies FR5, FR13, FR14 of show-zone-abbreviations-and-zone-label-setting (D5).
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { ZoneLabelPart } from "@/preferences";
import {
  presentZoneLabelExample,
  presentZoneLine,
  ZoneLinePartKind,
} from "./zoneLine";

const { UTC_OFFSET, ZONE_ABBREVIATION } = ZoneLabelPart;
const BOTH = [UTC_OFFSET, ZONE_ABBREVIATION];
const JULY_INSTANT = Temporal.Instant.from("2026-07-15T12:00:00Z");

function line(overrides: Partial<Parameters<typeof presentZoneLine>[0]> = {}) {
  return presentZoneLine({
    placeText: "India",
    zoneAbbreviationLabel: "IST",
    utcOffsetLabel: "UTC+5:30",
    zoneLabelParts: BOTH,
    ...overrides,
  });
}

const texts = (parts: ReturnType<typeof presentZoneLine>) =>
  parts.map((part) => part.text);

describe("presentZoneLine", () => {
  it.each([
    [BOTH, ["India", "IST", "UTC+5:30"]],
    [[UTC_OFFSET], ["India", "UTC+5:30"]],
    [[ZONE_ABBREVIATION], ["India", "IST"]],
    [[], ["India"]],
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

describe("presentZoneLabelExample", () => {
  it.each([
    ["en", ["India", "IST", "UTC+5:30"]],
    ["ru", ["Индия", "IST", "UTC+5:30"]],
  ])("gives the example in %s", (language, expected) => {
    const parts = presentZoneLabelExample({
      instant: JULY_INSTANT,
      language,
      translate: i18n.getFixedT(language),
      zoneLabelParts: BOTH,
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
    expect(texts(parts)).toEqual(["India"]);
  });
});
