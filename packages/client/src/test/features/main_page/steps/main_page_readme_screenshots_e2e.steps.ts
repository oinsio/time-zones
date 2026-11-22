import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { dismissOfflineReadyNotice } from "../../time_selection/steps/timeSelectionE2eHelpers";
import { englishLocale } from "./englishTexts";

const { When } = createBdd(test);

const LOCALES_DIRECTORY = join(process.cwd(), "src", "locales");

/** The `app.dismiss` text of the locale the scenario seeded (English when none). */
function dismissNameOfLanguage(language: string | null): string {
  if (language === null) return englishLocale.app.dismiss;
  const locale = JSON.parse(
    readFileSync(join(LOCALES_DIRECTORY, `${language}.json`), "utf8"),
  ) as { app: { dismiss: string } };
  return locale.app.dismiss;
}

/**
 * Implements FR8 of keep-location-menu-in-view-and-clear-range-after-share:
 * a README screenshot shows the screen of a returning user, without the
 * one-time Offline-ready notice, in either interface language.
 */
When("the offline-ready notice is dismissed", async ({ locationsWorld }) => {
  await dismissOfflineReadyNotice(
    locationsWorld.page,
    dismissNameOfLanguage(locationsWorld.seededInterfaceLanguage),
  );
});
