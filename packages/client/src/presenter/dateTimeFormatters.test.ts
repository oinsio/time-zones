// Verifies FR1, FR2, FR5 of replace-wall-clock-row-budgets-with-deterministic-checks (D1).
import { describe, expect, it } from "vitest";
import {
  HOUR_LABEL_FORMAT_OPTIONS,
  LOCAL_DATE_FORMAT_OPTIONS,
  LOCAL_TIME_FORMAT_OPTIONS,
} from "@/constants";
import { Temporal } from "@/lib/temporal";
import { HourFormat } from "@/preferences";
import { DateTimeLabelKind, getDateTimeFormatter } from "./dateTimeFormatters";

const ZONE = "Asia/Tokyo";
const OTHER_ZONE = "Europe/Paris";
const INSTANT_MILLISECONDS = Temporal.Instant.from(
  "2026-07-15T12:30:00Z",
).epochMilliseconds;

describe("getDateTimeFormatter", () => {
  it("should return the same formatter for the same language, zone and kind", () => {
    expect(
      getDateTimeFormatter(
        "en",
        ZONE,
        DateTimeLabelKind.LOCAL_TIME,
        HourFormat.H24,
      ),
    ).toBe(
      getDateTimeFormatter(
        "en",
        ZONE,
        DateTimeLabelKind.LOCAL_TIME,
        HourFormat.H24,
      ),
    );
  });

  it("should return distinct formatters for each kind", () => {
    const formatters = Object.values(DateTimeLabelKind).map((kind) =>
      getDateTimeFormatter("en", ZONE, kind, HourFormat.H24),
    );

    expect(new Set(formatters).size).toBe(formatters.length);
  });

  it("should return distinct formatters for another zone", () => {
    expect(
      getDateTimeFormatter("en", ZONE, DateTimeLabelKind.HOUR, HourFormat.H24),
    ).not.toBe(
      getDateTimeFormatter(
        "en",
        OTHER_ZONE,
        DateTimeLabelKind.HOUR,
        HourFormat.H24,
      ),
    );
  });

  it("should return distinct formatters for another language", () => {
    expect(
      getDateTimeFormatter("en", ZONE, DateTimeLabelKind.HOUR, HourFormat.H24),
    ).not.toBe(
      getDateTimeFormatter("ru", ZONE, DateTimeLabelKind.HOUR, HourFormat.H24),
    );
  });

  it.each([
    [DateTimeLabelKind.LOCAL_TIME, LOCAL_TIME_FORMAT_OPTIONS],
    [DateTimeLabelKind.LOCAL_DATE, LOCAL_DATE_FORMAT_OPTIONS],
    [DateTimeLabelKind.HOUR, HOUR_LABEL_FORMAT_OPTIONS],
  ])("should format %s like its options", (kind, options) => {
    const expected = new Intl.DateTimeFormat("ru", {
      ...options,
      timeZone: ZONE,
    }).format(INSTANT_MILLISECONDS);

    expect(
      getDateTimeFormatter("ru", ZONE, kind, HourFormat.H24).format(
        INSTANT_MILLISECONDS,
      ),
    ).toBe(expected);
  });
});

// Verifies FR5, NFR-P1 of add-settings-page-and-device-time-location (D8).
describe("getDateTimeFormatter hour format", () => {
  const nyInstant = Temporal.Instant.from(
    "2026-03-08T07:30:00Z",
  ).epochMilliseconds;
  const collapseSpaces = (text: string) => text.replace(/[\u202f\u00a0]/g, " ");

  it("should write the local time of New York in the 12-hour format", () => {
    const formatter = getDateTimeFormatter(
      "en",
      "America/New_York",
      DateTimeLabelKind.LOCAL_TIME,
      HourFormat.H12,
    );
    expect(collapseSpaces(formatter.format(nyInstant))).toBe("3:30 AM");
  });

  it("should write the local time of New York in the 24-hour format", () => {
    const formatter = getDateTimeFormatter(
      "en",
      "America/New_York",
      DateTimeLabelKind.LOCAL_TIME,
      HourFormat.H24,
    );
    expect(formatter.format(nyInstant)).toBe("03:30");
  });

  it("should write the hour label in the 12-hour format", () => {
    const formatter = getDateTimeFormatter(
      "en",
      "America/New_York",
      DateTimeLabelKind.HOUR,
      HourFormat.H12,
    );
    const fourOclock = Temporal.Instant.from(
      "2026-03-08T08:00:00Z",
    ).epochMilliseconds;
    expect(collapseSpaces(formatter.format(fourOclock))).toBe("4 AM");
  });

  it("should return the same formatter for the same hour format", () => {
    expect(
      getDateTimeFormatter(
        "en",
        ZONE,
        DateTimeLabelKind.LOCAL_TIME,
        HourFormat.H12,
      ),
    ).toBe(
      getDateTimeFormatter(
        "en",
        ZONE,
        DateTimeLabelKind.LOCAL_TIME,
        HourFormat.H12,
      ),
    );
  });

  it("should return another formatter for another hour format", () => {
    expect(
      getDateTimeFormatter(
        "en",
        ZONE,
        DateTimeLabelKind.LOCAL_TIME,
        HourFormat.H12,
      ),
    ).not.toBe(
      getDateTimeFormatter(
        "en",
        ZONE,
        DateTimeLabelKind.LOCAL_TIME,
        HourFormat.H24,
      ),
    );
  });

  it("should share the date formatter between hour formats", () => {
    expect(
      getDateTimeFormatter(
        "en",
        ZONE,
        DateTimeLabelKind.LOCAL_DATE,
        HourFormat.H12,
      ),
    ).toBe(
      getDateTimeFormatter(
        "en",
        ZONE,
        DateTimeLabelKind.LOCAL_DATE,
        HourFormat.H24,
      ),
    );
  });
});
