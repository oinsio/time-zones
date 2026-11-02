// Verifies FR5, M4 of show-city-labels-in-interface-language (D5).
import i18n from "i18next";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { fakeClock, Temporal } from "@/lib/temporal";
import { HourFormat } from "@/preferences";

const DIALECT_CODE = "tlh";

vi.mock("@/locales/localeRegistry", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/locales/localeRegistry")>();
  const { buildRegisteredLocale: buildLocale } = await import(
    "@/test/factories/localeFixtures"
  );
  return {
    ...original,
    localeRegistry: [
      ...original.localeRegistry,
      buildLocale("tlh", "Klingon", "tlhIngan Hol", "ru"),
      buildLocale("ru-KZ", "Russian (Kazakhstan)", "Русский (Казахстан)", "ru"),
      buildLocale("ru", "Russian", "Русский"),
    ],
  };
});

// The setup files load the real registry first, so the presenters load anew under the mock.
let presentCalendarMonth: typeof import("./calendarMonth").presentCalendarMonth;
let presentCountryName: typeof import("./countryName").presentCountryName;
let presentDateBar: typeof import("./dateBar").presentDateBar;
let formatLocalDate: typeof import("./localDateTime").formatLocalDate;

beforeAll(async () => {
  vi.resetModules();
  ({ presentCalendarMonth } = await import("./calendarMonth"));
  ({ presentCountryName } = await import("./countryName"));
  ({ presentDateBar } = await import("./dateBar"));
  ({ formatLocalDate } = await import("./localDateTime"));
});

const zonedDateTime = fakeClock("2026-03-08T07:30:00Z")
  .instant()
  .toZonedDateTimeISO("Asia/Almaty");
const date = Temporal.PlainDate.from("2026-03-08");

const presentBar = (language: string) =>
  presentDateBar({
    effectiveDate: date,
    today: date,
    isPinned: false,
    gap: undefined,
    language,
    hourFormat: HourFormat.H24,
    translate: i18n.getFixedT(language),
  });

const presentMonth = (language: string) =>
  presentCalendarMonth({
    focusedDate: date,
    selectedDate: date,
    today: date,
    language,
  });

describe("Intl data of a dialect Intl does not know", () => {
  it("should have no Intl data of its own for the dialect", () => {
    expect(Intl.DateTimeFormat.supportedLocalesOf([DIALECT_CODE])).toEqual([]);
  });

  it("should name a country as its base language does", () => {
    expect(presentCountryName("KZ", DIALECT_CODE)).toBe(
      presentCountryName("KZ", "ru"),
    );
  });

  it("should write a local date as its base language does", () => {
    expect(formatLocalDate(zonedDateTime, DIALECT_CODE)).toBe(
      formatLocalDate(zonedDateTime, "ru"),
    );
  });

  it("should write the date bar as its base language does", () => {
    const { shortLabel, longLabel, fullDateLabel } = presentBar(DIALECT_CODE);
    const base = presentBar("ru");

    expect({ shortLabel, longLabel, fullDateLabel }).toEqual({
      shortLabel: base.shortLabel,
      longLabel: base.longLabel,
      fullDateLabel: base.fullDateLabel,
    });
  });

  it("should write the calendar month as its base language does", () => {
    const month = presentMonth(DIALECT_CODE);
    const base = presentMonth("ru");

    expect(month.heading).toBe(base.heading);
    expect(month.weekdays).toEqual(base.weekdays);
  });

  it.each([
    ["en", "Kazakhstan", "Sun, Mar 8"],
    ["ru", "Казахстан", "вс, 8 мар."],
    ["ru-KZ", "Казахстан", "вс, 8 мар."],
  ])("should keep %s as before", (language, countryName, localDate) => {
    expect(presentCountryName("KZ", language)).toBe(countryName);
    expect(formatLocalDate(zonedDateTime, language)).toBe(localDate);
  });
});
