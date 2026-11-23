// Verifies FR13, FR18 of add-unix-time-converter-tool.
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { presentRelativeTime } from "./presentRelativeTime";

const NOW = Temporal.Instant.fromEpochMilliseconds(1_795_432_987_000);
const at = (unixSeconds: number) =>
  Temporal.Instant.fromEpochMilliseconds(unixSeconds * 1000);

describe("presentRelativeTime", () => {
  it.each([
    [1_795_432_957, "сейчас", "now"],
    [1_795_432_087, "15 минут назад", "15 minutes ago"],
    [1_795_440_187, "через 2 часа", "in 2 hours"],
    [1_795_173_787, "3 дня назад", "3 days ago"],
    [1_700_000_000, "3 года назад", "3 years ago"],
    [0, "56 лет назад", "56 years ago"],
    [1_795_432_987 - 60, "1 минуту назад", "1 minute ago"],
    [1_795_432_987 + 3600, "через 1 час", "in 1 hour"],
    [1_795_432_987 - 86_400 * 40, "1 месяц назад", "1 month ago"],
    [1_795_432_987 - 86_400 * 150, "4 месяца назад", "4 months ago"],
    [1_795_432_987 - 86_400 * 31 * 7, "7 месяцев назад", "7 months ago"],
    [1_795_432_987 + 86_400, "через 1 день", "in 1 day"],
    [1_795_432_987 + 86_400 * 5, "через 5 дней", "in 5 days"],
    [1_795_432_987 + 86_400 * 366, "через 1 год", "in 1 year"],
  ])("should read %i as %s and %s", async (unixSeconds, russian, english) => {
    await i18n.changeLanguage("ru");
    expect(presentRelativeTime(at(unixSeconds), NOW, i18n.t)).toBe(russian);
    await i18n.changeLanguage("en");
    expect(presentRelativeTime(at(unixSeconds), NOW, i18n.t)).toBe(english);
    await i18n.changeLanguage("ru");
  });
});
