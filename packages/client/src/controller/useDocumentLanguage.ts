import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Keeps the document title and the `<html lang>` attribute in sync with the
 * active UI language.
 * Implements FR2 of setup-app-shell-and-pages-deploy.
 */
export function useDocumentLanguage(): void {
  const { t, i18n } = useTranslation();
  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;
  const appTitle = t("app.title");

  useEffect(() => {
    document.documentElement.lang = activeLanguage;
    document.title = appTitle;
  }, [activeLanguage, appTitle]);
}
