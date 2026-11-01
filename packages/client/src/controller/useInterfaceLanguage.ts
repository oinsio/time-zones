import { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { readBrowserLanguages } from "@/lib/browserLanguages";
import { resolveInterfaceLanguage } from "@/locales";
import { usePreferences } from "./usePreferences";

/**
 * Applies the interface language of the preferences, or the browser's when none
 * is chosen, to i18next before the browser paints. Covers a choice, Reset, a
 * change from another tab and an unreadable load. The start language is already
 * applied by `i18n.ts`, so a matching language changes nothing.
 * Implements FR5, FR7, FR12 of add-interface-language-selection (D3).
 */
export function useInterfaceLanguage(): void {
  const { preferences } = usePreferences();
  const { i18n } = useTranslation();
  const resolvedCode = resolveInterfaceLanguage(
    preferences.interfaceLanguage,
    readBrowserLanguages(),
  );
  useLayoutEffect(() => {
    if (resolvedCode !== (i18n.resolvedLanguage ?? i18n.language)) {
      void i18n.changeLanguage(resolvedCode);
    }
  }, [resolvedCode, i18n]);
}
