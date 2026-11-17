// Implements FR5, FR6 of polish-settings-and-remove-offline-update-notice: the settings page over real preferences storage, with a chosen device time zone, language and hour format.
// Implements FR12, FR13 of apply-data-updates-silently: the city data attribution of that page.
import {
  act,
  cleanup,
  render,
  screen,
  within,
} from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import {
  createInMemoryLocationRepository,
  createLocalStoragePreferencesRepository,
} from "@/adapters";
import { SettingsPage } from "@/app/settings";
import { PREFERENCES_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
import { LocationsProvider, PreferencesProvider } from "@/controller";
import { type Clock, fakeClock } from "@/lib/temporal";
import { DEFAULT_PREFERENCES, HourFormat } from "@/preferences";
import { createManualTickScheduler } from "@/test/tickSchedulers";
import {
  createManualWriteScheduler,
  immediateWriteScheduler,
} from "@/test/writeSchedulers";

const NO_OP = () => undefined;
const DEPLOY_TIME_SELECTOR = "[data-deploy-time]";
const A_DAY_AFTER_THE_BUILD = "2026-03-09T07:30:00Z";
const HOUR_FORMAT_BY_NAME = {
  "24-hour": HourFormat.H24,
  "12-hour": HourFormat.H12,
} as const;
const LANGUAGE_CODE_BY_NAME = { English: "en", Russian: "ru" } as const;

export type HourFormatName = keyof typeof HOUR_FORMAT_BY_NAME;
export type LanguageName = keyof typeof LANGUAGE_CODE_BY_NAME;

/** Per-scenario state of the deploy time features. */
export const createDeployTimeWorld = () => {
  let container: HTMLElement | undefined;
  const tickScheduler = createManualTickScheduler();

  const showSettings = async (options: {
    zone: string;
    language: LanguageName;
    hourFormat: HourFormatName;
    clock?: Clock;
  }) => {
    await i18n.changeLanguage(LANGUAGE_CODE_BY_NAME[options.language]);
    localStorage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify({
        schemaVersion: PREFERENCES_SCHEMA_VERSION,
        payload: {
          ...DEFAULT_PREFERENCES,
          hourFormat: HOUR_FORMAT_BY_NAME[options.hourFormat],
        },
      }),
    );
    container = render(
      <PreferencesProvider
        repository={createLocalStoragePreferencesRepository({
          getStorage: () => localStorage,
          createChannel: () => undefined,
        })}
        writeScheduler={createManualWriteScheduler()}
      >
        <LocationsProvider
          repository={createInMemoryLocationRepository()}
          writeScheduler={immediateWriteScheduler}
          clock={
            options.clock ?? fakeClock(A_DAY_AFTER_THE_BUILD, options.zone)
          }
          tickScheduler={tickScheduler}
        >
          <SettingsPage notices={null} onBack={NO_OP} />
        </LocationsProvider>
      </PreferencesProvider>,
    ).container;
  };

  return {
    showSettings,
    reset: async () => {
      cleanup();
      container = undefined;
      localStorage.clear();
      await i18n.changeLanguage("en");
    },
    finish: async () => {
      cleanup();
      await i18n.changeLanguage("ru");
    },
    /** A minute passes: the locations re-present their rows. */
    runMinuteTick: () => act(() => tickScheduler.runPending()),
    /** Expands the language group, then picks the language by its native name. */
    chooseLanguage: async (nativeName: string) => {
      await userEvent.click(
        screen.getByRole("button", { name: /^(Language|Язык)/ }),
      );
      await userEvent.click(
        within(screen.getByRole("list")).getByRole("button", {
          name: nativeName,
        }),
      );
    },
    /** The city data attribution link text, with ICU no-break spaces written as spaces. */
    cityDataAttributionText: () =>
      (
        screen.getByRole("link", { name: /GeoNames/ }).textContent ?? ""
      ).replace(/[\u202F\u00A0]/g, " "),
    chooseHourFormat: (hourFormatName: HourFormatName) =>
      userEvent.click(screen.getByRole("radio", { name: hourFormatName })),
    /** The elements of the settings main that come after the deploy time. */
    elementsAfterDeployTime: () => {
      const main = container?.querySelector("main");
      const children = [...(main?.children ?? [])];
      return children.slice(
        children.indexOf(
          container?.querySelector(DEPLOY_TIME_SELECTOR) as Element,
        ) + 1,
      );
    },
    /** The deploy time text with the no-break spaces of ICU written as spaces. */
    deployTimeText: () =>
      (
        container?.querySelector(DEPLOY_TIME_SELECTOR)?.textContent ?? ""
      ).replace(/[\u202F\u00A0]/g, " "),
  };
};
