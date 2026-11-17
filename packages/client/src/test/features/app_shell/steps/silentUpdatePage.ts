/**
 * Page helpers of the silent update E2E steps: the waiting build, the check for
 * a new build, the entry script in force and the deploy time on the device clock.
 * Implements FR3, FR4, FR11 of apply-data-updates-silently (D8).
 */
import type { Page } from "@playwright/test";
import { Temporal } from "@/lib/temporal";

const ENTRY_SCRIPT_SELECTOR = 'script[type="module"]';
const DEVICE_TIME_ZONE_ID = "Asia/Almaty";

export const hasWaitingBuild = (page: Page) =>
  page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration?.waiting != null;
  });

export const checkForNewBuild = (page: Page) =>
  page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration?.update();
  });

export const entryScriptOf = async (page: Page) =>
  (await page.locator(ENTRY_SCRIPT_SELECTOR).first().getAttribute("src")) ?? "";

/** The time of day of the build instant on the device clock, as the settings page shows it. */
export const deployClockOf = (deployInstant: string) =>
  Temporal.Instant.from(deployInstant)
    .toZonedDateTimeISO(DEVICE_TIME_ZONE_ID)
    .toPlainTime()
    .toString({ smallestUnit: "minute" });
