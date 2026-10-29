// Verifies FR6, NFR-A3 of set-home-location-and-show-differences (D5): difference texts.
import { describe, expect, it } from "vitest";
import i18n from "@/i18n";
import { formatOffsetDifference } from "./offsetDifference";

const format = (minutes: number, language: "en" | "ru") =>
  formatOffsetDifference(minutes, i18n.getFixedT(language));

describe("formatOffsetDifference text", () => {
  it.each([
    [-120, "en", "−2 h"],
    [180, "ru", "+3 ч"],
    [30, "en", "+0:30"],
    [-330, "en", "−5:30"],
    [345, "ru", "+5:45"],
    [0, "en", "0 h"],
    [0, "ru", "0 ч"],
    [60, "en", "+1 h"],
    [-45, "en", "−0:45"],
  ] as const)(
    "should give %i minutes in %s as %s",
    (minutes, language, text) => {
      expect(format(minutes, language).label).toBe(text);
    },
  );
});

describe("formatOffsetDifference accessible text", () => {
  it.each([
    [-120, "en", "2 hours behind"],
    [60, "en", "1 hour ahead"],
    [30, "en", "30 minutes ahead"],
    [1, "en", "1 minute ahead"],
    [330, "en", "5 hours 30 minutes ahead"],
    [-120, "ru", "на 2 часа раньше"],
    [345, "ru", "на 5 часов 45 минут позже"],
    [60, "ru", "на 1 час позже"],
    [-1, "ru", "на 1 минуту раньше"],
    [0, "ru", "то же время"],
    [0, "en", "same time"],
  ] as const)(
    "should read %i minutes in %s as %s",
    (minutes, language, text) => {
      expect(format(minutes, language).accessibleLabel).toBe(text);
    },
  );
});
