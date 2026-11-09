import { ChevronLeft, Monitor, Moon, Sun } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { HOUR_FORMAT_PICTOGRAMS, THEME_PREFERENCE_ORDER } from "@/constants";
import {
  PreferencesStatus,
  useActiveInterfaceLanguage,
  usePreferences,
} from "@/controller";
import { HourFormat, ThemePreference } from "@/preferences";
import { DeployTime } from "./DeployTime";
import { GnomishFactoryCredit } from "./GnomishFactoryCredit";
import { InterfaceLanguageGroup } from "./InterfaceLanguageGroup";
import { SettingsOptionGroup } from "./SettingsOptionGroup";
import { ViewModeGroup } from "./ViewModeGroup";
import { ZoneLabelGroup } from "./ZoneLabelGroup";

type SettingsPageProps = {
  /** Contents of the polite notices region, as on the main page. */
  notices: ReactNode;
  onBack: () => void;
};

const THEME_OPTION_ICONS = {
  [ThemePreference.LIGHT]: Sun,
  [ThemePreference.DARK]: Moon,
  [ThemePreference.SYSTEM]: Monitor,
} as const;

const THEME_OPTION_LABEL_KEYS = {
  [ThemePreference.LIGHT]: "settings.themeLight",
  [ThemePreference.DARK]: "settings.themeDark",
  [ThemePreference.SYSTEM]: "settings.themeSystem",
} as const;

const HOUR_FORMAT_LABEL_KEYS = {
  [HourFormat.H12]: "settings.hourFormat12",
  [HourFormat.H24]: "settings.hourFormat24",
} as const;

/**
 * The settings page: the theme preference, the hour format, the view, the zone label, the interface language and the deploy time. It handles an
 * unreadable stored document (a note with Reset) and a failed save (a note).
 * Focus goes to its heading when it opens.
 * Implements FR3, FR4, FR5, FR7, FR16, NFR-A1, NFR-R1 of
 * add-settings-page-and-device-time-location (D10).
 * Implements FR1, NFR-A1, NFR-A2, UX1 of add-gnomish-factory-credit (D1).
 * Implements FR1, NFR-A1, UX1 of move-and-restyle-gnomish-factory-credit (D1).
 * Implements FR1, FR13 of add-interface-language-selection (D6).
 * Implements FR5 of polish-settings-and-remove-offline-update-notice (D4): the deploy time.
 * Implements FR12 of show-zone-abbreviations-and-zone-label-setting (D7): the zone label group.
 * Implements FR1, FR2, FR3, FR4 of compact-settings-controls (D1-D3).
 * Implements FR1, FR2 of add-view-mode-setting-and-grid-skeleton (D2): the view group after the hour format.
 */
export function SettingsPage({ notices, onBack }: SettingsPageProps) {
  const { t } = useTranslation();
  const {
    preferences,
    loadStatus,
    hasSaveFailed,
    setTheme,
    setHourFormat,
    setInterfaceLanguage,
    resetPreferences,
  } = usePreferences();
  const activeLanguage = useActiveInterfaceLanguage();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-screen-2xl flex-col px-4">
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-border pt-6 pb-4">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("settings.back")}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-center text-2xl font-semibold focus:outline-none"
        >
          {t("settings.title")}
        </h1>
        <span aria-hidden="true" className="min-w-11" />
      </header>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 py-6">
        {loadStatus === PreferencesStatus.UNREADABLE && (
          <div
            role="alert"
            className="flex flex-col items-start gap-3 text-danger"
          >
            <p>{t("settings.unreadable")}</p>
            <button
              type="button"
              onClick={resetPreferences}
              className="min-h-11 rounded-md border border-border px-4 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              {t("settings.reset")}
            </button>
          </div>
        )}
        {hasSaveFailed && (
          <p role="alert" className="text-danger">
            {t("settings.saveFailed")}
          </p>
        )}
        <GnomishFactoryCredit />
        <SettingsOptionGroup
          caption={t("settings.themeLabel")}
          options={THEME_PREFERENCE_ORDER.map((theme) => ({
            value: theme,
            label: t(THEME_OPTION_LABEL_KEYS[theme]),
            Icon: THEME_OPTION_ICONS[theme],
          }))}
          selectedValue={preferences.theme}
          onSelect={setTheme}
        />
        <SettingsOptionGroup
          caption={t("settings.hourFormatLabel")}
          options={Object.values(HourFormat).map((hourFormat) => ({
            value: hourFormat,
            label: t(HOUR_FORMAT_LABEL_KEYS[hourFormat]),
            pictogram: HOUR_FORMAT_PICTOGRAMS[hourFormat],
          }))}
          selectedValue={preferences.hourFormat}
          onSelect={setHourFormat}
        />
        <ViewModeGroup />
        <ZoneLabelGroup />
        <InterfaceLanguageGroup
          activeCode={activeLanguage.code}
          onChoose={setInterfaceLanguage}
        />
        <DeployTime />
      </main>
      <footer className="sticky bottom-0 -mx-4">
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none flex flex-col items-center gap-2 p-4"
        >
          {notices}
        </div>
      </footer>
    </div>
  );
}
