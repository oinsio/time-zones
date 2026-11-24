// Verifies FR9, FR10, FR18, NFR-P2, UX1 of add-unix-time-converter-tool.
import i18n from "i18next";
import { afterEach, describe, expect, it } from "vitest";
import { fakeClock } from "@/lib/temporal";
import { type Location, LocationKind } from "@/model";
import {
  ConverterCommandType,
  type ConverterState,
  createConverterState,
  reduceConverter,
} from "@/model/unixTime";
import { HourFormat, ZoneLabelPart } from "@/preferences";
import { presentConverterRows } from "./presentConverterRows";

const NOW = fakeClock("2026-11-23T11:23:07Z").instant();
const SAMPLE_UNIX_MILLISECONDS = "1795432987123";
const city = (
  id: string,
  label: string,
  timeZoneId: string,
  countryCode: string,
): Location => ({
  id,
  kind: LocationKind.CITY,
  timeZoneId,
  label,
  countryCode,
});
const LOCATIONS = [
  city("almaty", "Almaty", "Asia/Almaty", "KZ"),
  city("moscow", "Moscow", "Europe/Moscow", "RU"),
  city("new-york", "New York", "America/New_York", "US"),
];

const present = (
  state: ConverterState,
  {
    language = "ru",
    hourFormat = HourFormat.H24,
    locations = LOCATIONS,
    homeLocationId = "almaty" as string | null,
  } = {},
) =>
  presentConverterRows(locations, state, {
    language: language as "ru" | "en",
    hourFormat,
    zoneLabelParts: Object.values(ZoneLabelPart),
    translate: i18n.getFixedT(language),
    deviceTimeZoneId: "Asia/Almaty",
    homeLocationId,
  });
const typed = (text: string) =>
  reduceConverter(createConverterState(NOW), {
    type: ConverterCommandType.TYPE_INPUT,
    text,
  });

afterEach(() => i18n.changeLanguage("ru"));

describe("presentConverterRows", () => {
  it("should give one row per location in list order", () => {
    expect(present(typed("1795432987")).map((row) => row.id)).toEqual([
      "almaty",
      "moscow",
      "new-york",
    ]);
  });

  it("should show the local time with the fraction digits of the precision", () => {
    expect(
      present(typed(SAMPLE_UNIX_MILLISECONDS)).map((row) => row.timeLabel),
    ).toEqual(["16:23:07.123", "14:23:07.123", "06:23:07.123"]);
  });

  it("should show the local time of a whole second with no fraction", () => {
    expect(present(typed("1795432987"))[1].timeLabel).toBe("14:23:07");
  });

  it("should show the time in the 12-hour format", () => {
    const [, moscow] = present(typed(SAMPLE_UNIX_MILLISECONDS), {
      hourFormat: HourFormat.H12,
    });
    expect(moscow.timeLabel).toBe("2:23:07.123 PM");
  });

  it("should show the local date of the row and its ISO date", () => {
    const [almaty] = present(typed("1795432987"));
    expect(almaty.dateLabel).toBe("пн, 23 нояб.");
    expect(almaty.localIsoDate).toBe("2026-11-23");
  });

  it("should carry the zone of the row for its commands", () => {
    expect(present(typed("1795432987"))[2].timeZoneId).toBe("America/New_York");
  });

  it("should give one row for the device time zone with an empty list", () => {
    const rows = present(typed("1795432987"), { locations: [] });
    expect(rows).toHaveLength(1);
    expect(rows[0].timeZoneId).toBe("Asia/Almaty");
    expect(rows[0].timeLabel).toBe("16:23:07");
  });

  it("should mark the home location", () => {
    const [almaty, moscow] = present(typed("1795432987"));
    expect(almaty.mark).toBeDefined();
    expect(moscow.mark).toBeUndefined();
  });

  it("should name the time field and the date button of each row", () => {
    const [, moscow] = present(typed("1795432987"));
    expect(moscow.timeInputLabel).toBe("Время — Moscow, 14:23:07");
    expect(moscow.dateButtonLabel).toContain("Moscow");
  });

  it("should write the names in English for an English interface", async () => {
    await i18n.changeLanguage("en");
    const [, moscow] = present(typed("1795432987"), { language: "en" });
    expect(moscow.timeInputLabel).toBe("Time — Moscow, 14:23:07");
  });

  it("should show no wall-time hint for a moment that was not typed as a time", () => {
    expect(
      present(typed("1795432987")).every(
        (row) => row.wallTimeHint === undefined,
      ),
    ).toBe(true);
  });
});
