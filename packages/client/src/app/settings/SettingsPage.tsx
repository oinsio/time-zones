import { ChevronLeft, Monitor, Moon, Sun } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { PreferencesStatus, usePreferences } from "@/controller";
import { HourFormat, ThemePreference } from "@/preferences";
import { GnomishFactoryCredit } from "./GnomishFactoryCredit";
import { SettingsOptionGroup } from "./SettingsOptionGroup";

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
 * The settings page: the theme preference and the hour format. It handles an
 * unreadable stored document (a note with Reset) and a failed save (a note).
 * Focus goes to its heading when it opens.
 * Implements FR3, FR4, FR5, FR7, FR16, NFR-A1, NFR-R1 of
 * add-settings-page-and-device-time-location (D10).
 * Implements FR1, NFR-A1, NFR-A2, UX1 of add-gnomish-factory-credit (D1).
 * Implements FR1, NFR-A1, UX1 of move-and-restyle-gnomish-factory-credit (D1).
 */
export function SettingsPage({ notices, onBack }: SettingsPageProps) {
  const { t } = useTranslation();
  const {
    preferences,
    loadStatus,
    hasSaveFailed,
    setTheme,
    setHourFormat,
    resetPreferences,
  } = usePreferences();
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
          legend={t("settings.themeLabel")}
          options={Object.values(ThemePreference).map((theme) => ({
            value: theme,
            label: t(THEME_OPTION_LABEL_KEYS[theme]),
            Icon: THEME_OPTION_ICONS[theme],
          }))}
          selectedValue={preferences.theme}
          onSelect={setTheme}
        />
        <SettingsOptionGroup
          legend={t("settings.hourFormatLabel")}
          options={Object.values(HourFormat).map((hourFormat) => ({
            value: hourFormat,
            label: t(HOUR_FORMAT_LABEL_KEYS[hourFormat]),
          }))}
          selectedValue={preferences.hourFormat}
          onSelect={setHourFormat}
        />
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
