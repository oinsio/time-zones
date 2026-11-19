// Verifies FR3, FR4, M3 of match-here-mark-to-design: presented marks.
// Verifies FR10 of redesign-cards-grid-and-day-palettes: no mark has a visible caption.
import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import i18n from "@/i18n";
import { LocationMarkKind } from "@/model";
import { LOCATION_MARK_TEXT_KEYS, presentLocationMarks } from "./locationMark";

const LANGUAGES = ["en", "ru"];

describe("presentLocationMarks", () => {
  it("should present the here mark in English", () => {
    const marks = presentLocationMarks(i18n.getFixedT("en"));

    expect(marks[LocationMarkKind.HERE]).toEqual({
      kind: LocationMarkKind.HERE,
      accessibleLabel: "You are here",
    });
  });

  it("should present the here mark in Russian", () => {
    const mark = presentLocationMarks(i18n.getFixedT("ru"))[
      LocationMarkKind.HERE
    ];

    expect(mark.accessibleLabel).toBe("Вы здесь");
  });

  it("should take the accessible label from the translate function", () => {
    const translate = (() => "XYZ") as unknown as TFunction;

    const mark = presentLocationMarks(translate)[LocationMarkKind.HERE];

    expect(mark.accessibleLabel).toBe("XYZ");
  });

  it.each(
    Object.values(LocationMarkKind).flatMap((kind) =>
      LANGUAGES.map((language) => [kind, language] as const),
    ),
  )("should fully define the %s mark in %s", (kind, language) => {
    const mark = presentLocationMarks(i18n.getFixedT(language))[kind];

    expect(mark.accessibleLabel).not.toBe("");
  });

  it.each(Object.values(LocationMarkKind))(
    "should give the %s mark no caption",
    (kind) => {
      expect(Object.keys(LOCATION_MARK_TEXT_KEYS[kind])).toEqual([
        "accessibleLabelKey",
      ]);
      expect(
        presentLocationMarks(i18n.getFixedT("en"))[kind],
      ).not.toHaveProperty("caption");
    },
  );
});
