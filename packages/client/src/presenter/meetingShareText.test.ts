// Verifies FR14, FR16, UX3 of add-grid-meeting-range-and-share.
// Verifies FR3, FR4, FR6, FR7, M1, M2, M4 of add-meeting-share-dialog.
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  type InvitedLocation,
  LocationKind,
  type MeetingInvitation,
} from "@/model";
import {
  HourFormat,
  SHARE_ZONE_LABEL_PARTS,
  ZoneLabelPart,
} from "@/preferences";
import { presentMeetingShareZoneParts } from "./meetingShareLine";
import { presentMeetingShareText } from "./meetingShareText";
import { ZoneLinePartKind } from "./zoneLine";

const ALMATY = "Asia/Almaty";
const CITY_LABELS: Record<string, Record<string, string>> = {
  en: {
    "Asia/Almaty": "Almaty",
    "Europe/Moscow": "Moscow",
    "Asia/Kolkata": "Kolkata",
    "America/New_York": "New York",
    UTC: "UTC",
  },
  ru: {
    "Asia/Almaty": "Алматы",
    "Europe/Moscow": "Москва",
    "Asia/Kolkata": "Калькутта",
    "America/New_York": "Нью-Йорк",
    UTC: "UTC",
  },
};

const buildLocation = (timeZoneId: string): InvitedLocation => ({
  id: timeZoneId,
  kind: LocationKind.CITY,
  timeZoneId,
  label: timeZoneId,
});
const SAMPLE_ZONES = [
  ALMATY,
  "Europe/Moscow",
  "Asia/Kolkata",
  "America/New_York",
];
const buildInvitation = (
  zones: readonly string[] = SAMPLE_ZONES,
  start = "2026-03-08T04:00:00Z",
  end = "2026-03-08T06:00:00Z",
): MeetingInvitation => ({
  range: {
    start: Temporal.Instant.from(start),
    end: Temporal.Instant.from(end),
  },
  locations: zones.map(buildLocation),
});

function buildText({
  language = "en",
  invitation = buildInvitation(),
  hourFormat = HourFormat.H24,
  shareZoneLabelParts = SHARE_ZONE_LABEL_PARTS,
  referenceZoneId = ALMATY,
  getCityLabel = ({ timeZoneId }: InvitedLocation) =>
    CITY_LABELS[language][timeZoneId],
}: Partial<Parameters<typeof presentMeetingShareText>[0]> = {}) {
  return presentMeetingShareText({
    invitation,
    referenceZoneId,
    hourFormat,
    shareZoneLabelParts,
    language,
    translate: i18n.getFixedT(language),
    getCityLabel,
  }).split("\n");
}

const ENGLISH_SAMPLE = [
  "Meeting on Sunday, March 8, 2026, 2 h",
  "Almaty (UTC+5): 09:00–11:00",
  "Moscow (MSK, UTC+3): 07:00–09:00",
  "Kolkata (IST, UTC+5:30): 09:30–11:30",
  "New York (EST, UTC−5): 23:00–01:00 (a day earlier, Sat, Mar 7)",
];

describe("presentMeetingShareText", () => {
  it("should write the English sample meeting character for character", () => {
    expect(buildText()).toEqual(ENGLISH_SAMPLE);
  });

  it("should write the Russian sample meeting character for character", () => {
    expect(buildText({ language: "ru" })).toEqual([
      "Встреча в воскресенье, 8 марта 2026 г., 2 ч",
      "Алматы (UTC+5): 09:00–11:00",
      "Москва (МСК, UTC+3): 07:00–09:00",
      "Калькутта (IST, UTC+5:30): 09:30–11:30",
      "Нью-Йорк (EST, UTC−5): 23:00–01:00 (днём раньше, сб, 7 мар.)",
    ]);
  });

  it("should write only the included locations", () => {
    const lines = buildText({
      invitation: buildInvitation([ALMATY, "America/New_York"]),
    });
    expect(lines).toEqual([
      ENGLISH_SAMPLE[0],
      ENGLISH_SAMPLE[1],
      ENGLISH_SAMPLE[4],
    ]);
  });

  it("should hold no link", () => {
    expect(buildText().join("\n")).not.toMatch(/https?:/);
  });

  it("should write the spans in the 12-hour format", () => {
    expect(buildText({ hourFormat: HourFormat.H12 })[1]).toMatch(
      /^Almaty \(UTC\+5\): 9:00\sAM–11:00\sAM$/,
    );
  });

  it("should write the share language whatever the interface language is", () => {
    expect(buildText({ language: "en" }).join("\n")).not.toMatch(/[а-я]/i);
  });

  it("should name the label the city label owner returns for a device time location", () => {
    const deviceTimeLocation: InvitedLocation = {
      id: "device",
      kind: LocationKind.DEVICE_TIME,
      timeZoneId: ALMATY,
      label: "Device",
    };
    const lines = buildText({
      invitation: { ...buildInvitation(), locations: [deviceTimeLocation] },
      getCityLabel: ({ kind }) =>
        kind === LocationKind.DEVICE_TIME ? "Almaty" : "other",
    });
    expect(lines[1]).toBe("Almaty (UTC+5): 09:00–11:00");
  });

  it.each([
    [
      [ZoneLabelPart.ZONE_ABBREVIATION, ZoneLabelPart.UTC_OFFSET],
      "Moscow (MSK, UTC+3): 07:00–09:00",
      "Almaty (UTC+5): 09:00–11:00",
    ],
    [
      [ZoneLabelPart.ZONE_ABBREVIATION],
      "Moscow (MSK): 07:00–09:00",
      "Almaty: 09:00–11:00",
    ],
    [
      [ZoneLabelPart.UTC_OFFSET],
      "Moscow (UTC+3): 07:00–09:00",
      "Almaty (UTC+5): 09:00–11:00",
    ],
    [[], "Moscow: 07:00–09:00", "Almaty: 09:00–11:00"],
  ])("should follow the share zone label %j", (parts, moscow, almaty) => {
    const lines = buildText({ shareZoneLabelParts: parts });
    expect([lines[2], lines[1]]).toEqual([moscow, almaty]);
  });

  it("should not repeat UTC for the UTC location", () => {
    expect(buildText({ invitation: buildInvitation([ALMATY, "UTC"]) })[2]).toBe(
      "UTC: 04:00–06:00",
    );
  });

  it.each([
    ["2026-01-15T09:00:00Z", "2026-01-15T11:00:00Z", "Belgrade (CET, UTC+1):"],
    ["2026-07-15T08:00:00Z", "2026-07-15T10:00:00Z", "Belgrade (CEST, UTC+2):"],
  ])(
    "should write the zone parts in force at the start %s",
    (start, end, prefix) => {
      const lines = buildText({
        invitation: buildInvitation(["Europe/Belgrade"], start, end),
        referenceZoneId: "Europe/Belgrade",
        getCityLabel: () => "Belgrade",
      });
      expect(lines[1].startsWith(prefix)).toBe(true);
    },
  );

  it.each([
    ["2026-03-09", "в понедельник"],
    ["2026-03-10", "во вторник"],
    ["2026-03-11", "в среду"],
    ["2026-03-12", "в четверг"],
    ["2026-03-13", "в пятницу"],
    ["2026-03-14", "в субботу"],
    ["2026-03-15", "в воскресенье"],
  ])("should write the Russian heading of %s with %s", (date, phrase) => {
    const day = Temporal.PlainDate.from(date);
    const start = day.toZonedDateTime({ timeZone: ALMATY, plainTime: "09:00" });
    const heading = buildText({
      language: "ru",
      invitation: buildInvitation(
        [ALMATY],
        start.toInstant().toString(),
        start.add({ hours: 2 }).toInstant().toString(),
      ),
    })[0];
    expect(heading).toMatch(
      new RegExp(`^Встреча ${phrase}, ${day.day} марта 2026 г\\., 2 ч$`),
    );
  });
});

describe("presentMeetingShareZoneParts", () => {
  const partsFor = (timeZoneId: string, cityLabel: string) =>
    presentMeetingShareZoneParts({
      timeZoneId,
      instant: Temporal.Instant.from("2026-03-08T04:00:00Z"),
      cityLabel,
      shareZoneLabelParts: SHARE_ZONE_LABEL_PARTS,
      translate: i18n.getFixedT("ru"),
    });

  it("should return the part texts of Moscow in order", () => {
    expect(partsFor("Europe/Moscow", "Москва")).toEqual([
      { kind: ZoneLinePartKind.ZONE_ABBREVIATION, text: "МСК" },
      { kind: ZoneLinePartKind.UTC_OFFSET, text: "UTC+3" },
    ]);
  });

  it("should return no parts for the UTC location", () => {
    expect(partsFor("UTC", "UTC")).toEqual([]);
  });
});
