import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useActiveInterfaceLanguage } from "./useActiveInterfaceLanguage";

/**
 * Keeps the document title and the `<html lang>` attribute in sync with the
 * active UI language.
 * Implements FR2 of setup-app-shell-and-pages-deploy.
 * Implements FR5 of add-interface-language-selection (D3): follows the chosen language at once.
 */
export function useDocumentLanguage(): void {
  const { t } = useTranslation();
  const { code: activeLanguage } = useActiveInterfaceLanguage();
  const appTitle = t("app.title");

  useEffect(() => {
    document.documentElement.lang = activeLanguage;
    document.title = appTitle;
  }, [activeLanguage, appTitle]);
}
