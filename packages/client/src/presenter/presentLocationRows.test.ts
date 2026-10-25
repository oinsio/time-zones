// Verifies FR10, UX4 of add-locations-via-search (D9).
// Verifies FR2, FR3, FR5, FR6, UX2 of show-utc-offset-on-location-rows (D2).
// Verifies FR1, FR2, FR5 of mark-device-time-zone-in-location-list (D4).
// Verifies FR1, FR2, FR6 of show-local-time-and-date-on-location-cards (D3).
import i18n, { type TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import type { SupportedLanguage } from "@/i18n";
import { fakeClock } from "@/lib/temporal";
import { UNIT_TEST_DEVICE_TIME_ZONE } from "@/test/deviceTimeZone";
import { buildLocation, KNOWN_CITIES } from "@/test/factories/buildLocation";

import { presentLocationRows } from "./presentLocationRows";

const july = fakeClock("2026-07-15T12:00:00Z").instant();
const january = fakeClock("2026-01-15T12:00:00Z").instant();

const present = (
  locations: Parameters<typeof presentLocationRows>[0],
  language: SupportedLanguage = "en",
  options: {
    instant?: typeof july;
    translate?: TFunction;
    deviceTimeZoneId?: string;
  } = {},
) =>
  presentLocationRows(locations, {
    language,
    instant: options.instant ?? july,
    deviceTimeZoneId: options.deviceTimeZoneId ?? UNIT_TEST_DEVICE_TIME_ZONE,
    translate: options.translate ?? i18n.getFixedT(language),
  });

describe("present location rows", () => {
  it("should keep the list order and show the city label", () => {
    const rows = present([
      buildLocation({
        label: "Almaty",
        timeZoneId: "Asia/Almaty",
        countryCode: "KZ",
      }),
      buildLocation(),
    ]);
    expect(rows.map((row) => row.cityLabel)).toEqual(["Almaty", "Moscow"]);
  });

  it("should carry the location id", () => {
    const location = buildLocation();
    expect(present([location])[0]?.id).toBe(location.id);
  });

  it.each([
    ["en", "KZ", "Kazakhstan"],
    ["ru", "RU", "Россия"],
    ["en", "RU", "Russia"],
  ] as const)(
    "should name the country in %s for %s",
    (language, countryCode, expected) => {
      const rows = present([buildLocation({ countryCode })], language);
      expect(rows[0]?.countryName).toBe(expected);
    },
  );

  it("should give an empty country name for an empty code", () => {
    const rows = present([
      buildLocation({ label: "UTC", timeZoneId: "UTC", countryCode: "" }),
    ]);
    expect(rows[0]?.countryName).toBe("");
  });

  it("should give an empty country name for a code Intl does not know", () => {
    const rows = present([buildLocation({ countryCode: "QQ" })]);
    expect(rows[0]?.countryName).toBe("");
  });

  it("should show the offset of the location at the given instant", () => {
    expect(present([buildLocation()])[0]?.utcOffsetLabel).toBe("UTC+3");
  });

  it("should show the prefix alone for a zero offset", () => {
    const utc = buildLocation({
      label: "UTC",
      timeZoneId: "UTC",
      countryCode: "",
    });
    expect(present([utc])[0]?.utcOffsetLabel).toBe("UTC");
  });

  it("should respect daylight saving time for the given instant", () => {
    const newYork = buildLocation({
      label: "New York",
      timeZoneId: "America/New_York",
    });
    expect(
      present([newYork], "en", { instant: january })[0]?.utcOffsetLabel,
    ).toBe("UTC\u22125");
  });

  it("should take the UTC prefix from the translate function", () => {
    const translate = (() => "XYZ") as unknown as TFunction;
    expect(
      present([buildLocation()], "en", { translate })[0]?.utcOffsetLabel,
    ).toBe("XYZ+3");
  });

  it("should take the UTC prefix from the Russian locale", () => {
    expect(present([buildLocation()], "ru")[0]?.utcOffsetLabel).toBe("UTC+3");
  });

  it("should give an empty offset label and keep city and country for an unknown zone", () => {
    const row = present([
      buildLocation({ label: "Olympus", timeZoneId: "Mars/Olympus_Mons" }),
    ])[0];
    expect([row?.utcOffsetLabel, row?.cityLabel, row?.countryName]).toEqual([
      "",
      "Olympus",
      "Russia",
    ]);
  });
});

describe("present the device time zone badge", () => {
  const cityOf = (label: string) =>
    buildLocation({ label, ...KNOWN_CITIES[label] });
  const labelsFor = (
    cities: string[],
    deviceTimeZoneId: string,
    translate?: TFunction,
  ) =>
    present(cities.map(cityOf), "en", { deviceTimeZoneId, translate }).map(
      (row) => row.deviceTimeZoneLabel,
    );

  it.each([
    ["match", ["Almaty", "Moscow"], "Asia/Almaty", ["Your time zone", ""]],
    ["no match", ["Almaty", "Moscow"], "Asia/Tokyo", ["", ""]],
    [
      "multiple matches",
      ["Moscow", "Saint Petersburg", "Almaty"],
      "Europe/Moscow",
      ["Your time zone", "Your time zone", ""],
    ],
  ])("should label rows for %s", (_case, cities, deviceZone, expected) => {
    expect(labelsFor(cities, deviceZone)).toEqual(expected);
  });

  it("should take the label from the translate function", () => {
    const translate = (() => "XYZ") as unknown as TFunction;
    expect(labelsFor(["Almaty"], "Asia/Almaty", translate)).toEqual(["XYZ"]);
  });

  it("should label in Russian", () => {
    const rows = present([cityOf("Almaty")], "ru", {
      deviceTimeZoneId: "Asia/Almaty",
    });
    expect(rows[0]?.deviceTimeZoneLabel).toBe("Ваш часовой пояс");
  });
});

describe("present the local time and date", () => {
  const cityOf = (label: string) =>
    buildLocation({ label, ...KNOWN_CITIES[label] });
  const march = fakeClock("2026-03-08T07:30:00Z").instant();
  const tokyoMidnight = fakeClock("2026-03-08T16:00:00Z").instant();

  it("should show the time of each location at the given instant", () => {
    const rows = present([cityOf("Almaty"), cityOf("Moscow")], "en", {
      instant: march,
    });
    expect(rows.map((row) => row.localTimeLabel)).toEqual(["12:30", "10:30"]);
  });

  it("should show the date and its ISO form", () => {
    const row = present([cityOf("Almaty")], "en", { instant: march })[0];
    expect([row?.localDateLabel, row?.localIsoDate]).toEqual([
      "Sun, Mar 8",
      "2026-03-08",
    ]);
  });

  it("should use the date of the location's own zone", () => {
    const row = present([cityOf("Tokyo")], "en", {
      instant: tokyoMidnight,
    })[0];
    expect([
      row?.localTimeLabel,
      row?.localDateLabel,
      row?.localIsoDate,
    ]).toEqual(["01:00", "Mon, Mar 9", "2026-03-09"]);
  });

  it("should write the date in Russian", () => {
    const row = present([cityOf("Almaty")], "ru", { instant: march })[0];
    expect(row?.localDateLabel).toBe("вс, 8 мар.");
  });

  it("should give empty time and date for an unknown zone and keep the city", () => {
    const row = present(
      [buildLocation({ label: "Olympus", timeZoneId: "Mars/Olympus_Mons" })],
      "en",
      { instant: march },
    )[0];
    expect([
      row?.localTimeLabel,
      row?.localDateLabel,
      row?.localIsoDate,
      row?.cityLabel,
    ]).toEqual(["", "", "", "Olympus"]);
  });
});
