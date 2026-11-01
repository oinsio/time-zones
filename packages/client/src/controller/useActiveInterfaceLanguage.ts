import { useTranslation } from "react-i18next";
import type { CityNameLanguage } from "@/constants";
import {
  findRegisteredLocale,
  type InterfaceLanguageCode,
  type RegisteredLocale,
  resolveCityNameLanguage,
} from "@/locales";

export type ActiveInterfaceLanguage = {
  code: InterfaceLanguageCode;
  /** The registered locale of `code`; `undefined` only for a code outside the registry. */
  locale: RegisteredLocale | undefined;
  /** The language of the city data this interface language reads. */
  cityNameLanguage: CityNameLanguage;
};

/**
 * The interface language i18next has applied: the one owner of "the active
 * interface language" for every controller hook and view.
 *
 * Implements FR5, FR10 of add-interface-language-selection (D3).
 */
export function useActiveInterfaceLanguage(): ActiveInterfaceLanguage {
  const { i18n } = useTranslation();
  const code = i18n.resolvedLanguage ?? i18n.language;
  return {
    code,
    locale: findRegisteredLocale(code),
    cityNameLanguage: resolveCityNameLanguage(code),
  };
}
