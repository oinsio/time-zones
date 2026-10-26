// Verifies FR1, FR2, FR5 of replace-wall-clock-row-budgets-with-deterministic-checks (D1).
import { describe, expect, it } from "vitest";
import {
  HOUR_LABEL_FORMAT_OPTIONS,
  LOCAL_DATE_FORMAT_OPTIONS,
  LOCAL_TIME_FORMAT_OPTIONS,
} from "@/constants";
import { Temporal } from "@/lib/temporal";
import { DateTimeLabelKind, getDateTimeFormatter } from "./dateTimeFormatters";

const ZONE = "Asia/Tokyo";
const OTHER_ZONE = "Europe/Paris";
const INSTANT_MILLISECONDS = Temporal.Instant.from(
  "2026-07-15T12:30:00Z",
).epochMilliseconds;

describe("getDateTimeFormatter", () => {
  it("should return the same formatter for the same language, zone and kind", () => {
    expect(getDateTimeFormatter("en", ZONE, DateTimeLabelKind.LOCAL_TIME)).toBe(
      getDateTimeFormatter("en", ZONE, DateTimeLabelKind.LOCAL_TIME),
    );
  });

  it("should return distinct formatters for each kind", () => {
    const formatters = Object.values(DateTimeLabelKind).map((kind) =>
      getDateTimeFormatter("en", ZONE, kind),
    );

    expect(new Set(formatters).size).toBe(formatters.length);
  });

  it("should return distinct formatters for another zone", () => {
    expect(getDateTimeFormatter("en", ZONE, DateTimeLabelKind.HOUR)).not.toBe(
      getDateTimeFormatter("en", OTHER_ZONE, DateTimeLabelKind.HOUR),
    );
  });

  it("should return distinct formatters for another language", () => {
    expect(getDateTimeFormatter("en", ZONE, DateTimeLabelKind.HOUR)).not.toBe(
      getDateTimeFormatter("ru", ZONE, DateTimeLabelKind.HOUR),
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
      getDateTimeFormatter("ru", ZONE, kind).format(INSTANT_MILLISECONDS),
    ).toBe(expected);
  });
});
