import { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { readBrowserLanguages } from "@/lib/browserLanguages";
import { resolveInterfaceLanguage } from "@/locales";
import { useActiveInterfaceLanguage } from "./useActiveInterfaceLanguage";
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
  const { code: activeCode } = useActiveInterfaceLanguage();
  const { i18n } = useTranslation();
  const resolvedCode = resolveInterfaceLanguage(
    preferences.interfaceLanguage,
    readBrowserLanguages(),
  );
  useLayoutEffect(() => {
    if (resolvedCode !== activeCode) {
      void i18n.changeLanguage(resolvedCode);
    }
  }, [resolvedCode, activeCode, i18n]);
}
