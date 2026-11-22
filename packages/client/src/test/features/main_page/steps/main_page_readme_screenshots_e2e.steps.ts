import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { dismissOfflineReadyNotice } from "../../time_selection/steps/timeSelectionE2eHelpers";

const { When } = createBdd(test);

const OFFLINE_NOTICE_WAIT_MS = 1500;
const RUSSIAN_DISMISS_NAME = "Закрыть";

/**
 * Implements FR8 of keep-location-menu-in-view-and-clear-range-after-share:
 * a README screenshot shows the screen of a returning user, without the
 * one-time Offline-ready notice, in either interface language.
 */
When(
  "the offline-ready notice is dismissed",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await dismissOfflineReadyNotice(page);
    await page
      .getByRole("button", { name: RUSSIAN_DISMISS_NAME, exact: true })
      .click({ timeout: OFFLINE_NOTICE_WAIT_MS })
      .catch(() => undefined);
  },
);

