import { useTranslation } from "react-i18next";
import type { RegisteredLocale } from "@/locales";
import { LanguageGroup } from "@/views/shared";

type InterfaceLanguageGroupProps = {
  locales?: readonly RegisteredLocale[];
  activeCode: string;
  onChoose: (code: string) => void;
};

/**
 * The interface language group of the settings page: the shared language group
 * with the settings captions.
 * Implements FR1–FR6, NFR-A1, NFR-A2, UX1, UX2, UX4 of add-interface-language-selection (D6).
 * Implements FR4 of add-meeting-share-dialog (D7): the body moved to `LanguageGroup`.
 */
export function InterfaceLanguageGroup({
  locales,
  activeCode,
  onChoose,
}: InterfaceLanguageGroupProps) {
  const { t } = useTranslation();
  return (
    <LanguageGroup
      locales={locales}
      caption={t("settings.languageLabel")}
      getButtonLabel={(language) => t("settings.languageButton", { language })}
      activeCode={activeCode}
      onChoose={onChoose}
    />
  );
}
