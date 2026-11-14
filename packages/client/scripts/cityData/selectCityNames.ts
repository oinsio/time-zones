/**
 * Picks the English and the Russian name of a GeoNames city.
 * Implements FR2 of add-geonames-city-source (D8).
 */
import type { AlternateNameRow, CityNames } from "./cityDataTypes.ts";
import { NAME_LANGUAGE_ENGLISH, NAME_LANGUAGE_RUSSIAN } from "./constants.ts";

export type NameOverrides = Record<number, Partial<CityNames>>;

/** Hand fixes for names GeoNames gets wrong, keyed by GeoNames ID; each entry says why. */
export const NAME_OVERRIDES: NameOverrides = {
  // GeoNames' main name is the transliteration "Kazan’" with a trailing apostrophe; the common English name is Kazan
  551487: { en: "Kazan" },
};

function ofLanguage(alternates: AlternateNameRow[], language: string) {
  return alternates.filter((alternate) => alternate.language === language);
}

function pickEnglishName(
  mainName: string,
  alternates: AlternateNameRow[],
): string {
  return (
    ofLanguage(alternates, NAME_LANGUAGE_ENGLISH).find((row) => row.isPreferred)
      ?.name ?? mainName
  );
}

function pickRussianName(
  englishName: string,
  alternates: AlternateNameRow[],
): string {
  const russianNames = ofLanguage(alternates, NAME_LANGUAGE_RUSSIAN);
  return (
    russianNames.find((row) => row.isPreferred)?.name ??
    russianNames.find((row) => !row.isHistoric && !row.isColloquial)?.name ??
    englishName
  );
}

export function selectCityNames(
  city: { geonameId: number; name: string },
  alternates: AlternateNameRow[],
  overrides: NameOverrides = NAME_OVERRIDES,
): CityNames {
  const english = pickEnglishName(city.name, alternates);
  const russian = pickRussianName(english, alternates);
  const override = overrides[city.geonameId];
  return {
    en: override?.en ?? english,
    ru: override?.ru ?? russian,
  };
}
