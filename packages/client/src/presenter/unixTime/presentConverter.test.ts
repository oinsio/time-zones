// Verifies FR9, FR10, FR12, FR13, FR15, FR18, UX1 of add-unix-time-converter-tool.
import i18n from "i18next";
import { afterEach, describe, expect, it } from "vitest";
import { fakeClock } from "@/lib/temporal";
import { type Location, LocationKind } from "@/model";
import {
  ConverterCommandType,
  type ConverterState,
  createConverterState,
  reduceConverter,
  UnixTimeUnitChoice,
} from "@/model/unixTime";
import { HourFormat, ZoneLabelPart } from "@/preferences";
import { presentConverter } from "./presentConverter";

const NOW = fakeClock("2026-11-23T11:23:07Z").instant();
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
  city("kolkata", "Kolkata", "Asia/Kolkata", "IN"),
  city("new-york", "New York", "America/New_York", "US"),
];

const present = (
  state: ConverterState,
  { language = "ru", hourFormat = HourFormat.H24, locations = LOCATIONS } = {},
) =>
  presentConverter(state, locations, {
    now: NOW,
    language: language as "ru" | "en",
    hourFormat,
    zoneLabelParts: Object.values(ZoneLabelPart),
    translate: i18n.getFixedT(language),
    deviceTimeZoneId: "Asia/Almaty",
    homeLocationId: "almaty",
  });
const typeInput = (text: string, base = createConverterState(NOW)) =>
  reduceConverter(base, { type: ConverterCommandType.TYPE_INPUT, text });
const timeOf = (state: ConverterState, id: string, options = {}) =>
  present(state, options).rows.find((row) => row.id === id)?.timeLabel;

afterEach(() => i18n.changeLanguage("ru"));

describe("presentConverter rows", () => {
  it("should list one row per location with date and time in list order", () => {
    const { rows } = present(typeInput("1795432987123"));
    expect(
      rows.map(({ cityLabel, dateLabel, timeLabel }) => [
        cityLabel,
        dateLabel,
        timeLabel,
      ]),
    ).toEqual([
      ["Almaty", "пн, 23 нояб.", "16:23:07.123"],
      ["Moscow", "пн, 23 нояб.", "14:23:07.123"],
      ["Kolkata", "пн, 23 нояб.", "16:53:07.123"],
      ["New York", "пн, 23 нояб.", "06:23:07.123"],
    ]);
  });

  it.each([
    ["1795432987", "14:23:07"],
    ["1795432987123", "14:23:07.123"],
    ["1795432987123456", "14:23:07.123456"],
    ["1795432987123456789", "14:23:07.123456789"],
    ["1795432987.5", "14:23:07.500"],
    ["2026-11-23T11:23:07.1234Z", "14:23:07.123400"],
  ])("should show %s as %s in the Moscow row", (text, expected) => {
    expect(timeOf(typeInput(text), "moscow")).toBe(expected);
  });

  it("should show the 12-hour format with the fraction before the marker", () => {
    expect(
      timeOf(typeInput("1795432987123"), "moscow", {
        hourFormat: HourFormat.H12,
      })?.replace(/\s/g, " "),
    ).toBe("2:23:07.123 PM");
  });

  it("should show the zone line at the moment", () => {
    const { rows } = present(typeInput("1783000000"));
    const text = rows[3].zoneLineParts.map((part) => part.text).join(" ");
    expect(text).toContain("EDT");
    expect(text).toContain("UTC−4");
  });

  it("should mark the home row", () => {
    const { rows } = present(createConverterState(NOW));
    expect(rows[0].mark?.accessibleLabel).toBeTruthy();
    expect(rows[1].mark).toBeUndefined();
  });

  it("should show one row for the device time zone for an empty list", () => {
    const { rows } = present(createConverterState(NOW), { locations: [] });
    expect(rows).toHaveLength(1);
    expect(rows[0].timeLabel).toBe("16:23:07");
  });

  it("should name the time field and the date button by city", () => {
    const [almaty] = present(createConverterState(NOW)).rows;
    expect(almaty.timeInputLabel).toBe("Время — Almaty, 16:23:07");
    expect(almaty.dateButtonLabel).toBe("Выбрать дату — Almaty, пн, 23 нояб.");
  });

  it("should carry the local ISO date for the calendar", () => {
    expect(present(createConverterState(NOW)).rows[3].localIsoDate).toBe(
      "2026-11-23",
    );
  });

  it("should show the wall-time hint of a time in a DST gap only in its row", () => {
    const march = typeInput("2026-03-08T12:00:00Z");
    const state = reduceConverter(march, {
      type: ConverterCommandType.SET_ROW_WALL_TIME,
      locationId: "new-york",
      timeZoneId: "America/New_York",
      wallTime: { hour: 2, minute: 30, second: 15, fractionDigits: "" },
    });
    const { rows } = present(state);
    expect(rows[3].timeLabel).toBe("03:30:15");
    expect(rows[3].wallTimeHint).toContain("03:30:15");
    expect(rows[1].wallTimeHint).toBeUndefined();
  });

  it("should use city labels in the interface language when given", () => {
    const rows = presentConverter(createConverterState(NOW), LOCATIONS, {
      now: NOW,
      language: "ru",
      hourFormat: HourFormat.H24,
      zoneLabelParts: [],
      translate: i18n.getFixedT("ru"),
      deviceTimeZoneId: "Asia/Almaty",
      homeLocationId: null,
      cityLabels: new Map([["moscow", "Москва"]]),
    }).rows;
    expect(rows[1].cityLabel).toBe("Москва");
  });
});

describe("presentConverter input and messages", () => {
  it("should name the input and show its text", () => {
    const { input } = present(typeInput("1700000000"));
    expect(input).toMatchObject({
      text: "1700000000",
      name: "Unix-время или дата ISO 8601",
    });
    expect(input.message).toBeUndefined();
  });

  it.each([
    [
      "abc",
      "Введите Unix-время или дату и время в формате ISO 8601",
      "Enter a Unix time or an ISO 8601 date and time",
    ],
    [
      "86400000000000000000000",
      "Значение вне поддерживаемого диапазона дат",
      "The value is outside the supported date range",
    ],
  ])("should say what is wrong with %j", async (text, russian, english) => {
    expect(present(typeInput(text)).input.message).toBe(russian);
    await i18n.changeLanguage("en");
    expect(present(typeInput(text), { language: "en" }).input.message).toBe(
      english,
    );
  });

  it("should offer the hint text for the empty input", () => {
    expect(present(typeInput("")).input.hint).toBe(
      "Введите Unix-время или дату и время в формате ISO 8601",
    );
  });
});

describe("presentConverter unit options, notations and actions", () => {
  it("should offer Auto and the four units with the choice selected", async () => {
    const state = reduceConverter(createConverterState(NOW), {
      type: ConverterCommandType.CHOOSE_UNIT,
      unitChoice: UnixTimeUnitChoice.MILLISECONDS,
    });
    expect(
      present(state).unitOptions.map(({ label, isSelected }) => [
        label,
        isSelected,
      ]),
    ).toEqual([
      ["Авто", false],
      ["Секунды", false],
      ["Миллисекунды", true],
      ["Микросекунды", false],
      ["Наносекунды", false],
    ]);
    await i18n.changeLanguage("en");
    expect(
      present(state, { language: "en" }).unitOptions.map(({ label }) => label),
    ).toEqual([
      "Auto",
      "Seconds",
      "Milliseconds",
      "Microseconds",
      "Nanoseconds",
    ]);
  });

  it("should name the unit in force", () => {
    expect(present(typeInput("1795432987123")).unitInForceLabel).toBe(
      "Единица: Миллисекунды",
    );
  });

  it("should show the notations of the sample", () => {
    const notations = present(typeInput("1795432987123456")).notations;
    expect(notations.map(({ label, text }) => [label, text])).toEqual([
      ["Секунды", "1795432987"],
      ["Миллисекунды", "1795432987123"],
      ["Микросекунды", "1795432987123456"],
      ["Наносекунды", "1795432987123456000"],
      ["ISO 8601", "2026-11-23T11:23:07.123456Z"],
    ]);
    expect(notations[0].copyLabel).toBe("Копировать: Секунды");
  });

  it("should flag Now and Show on main page active only while pinned", () => {
    expect(present(createConverterState(NOW))).toMatchObject({
      isNowActive: false,
      isShowOnMainPageActive: false,
    });
    expect(present(typeInput("1700000000"))).toMatchObject({
      isNowActive: true,
      isShowOnMainPageActive: true,
    });
  });

  it("should present the relative time", () => {
    expect(present(typeInput("1700000000")).relativeTime).toBe("3 года назад");
    expect(present(createConverterState(NOW)).relativeTime).toBe("сейчас");
  });
});
