// Verifies FR3, FR4, FR11, M1, NFR-A1 of apply-data-updates-silently: the silent update in a real browser.
import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { APP_REVISION_FILE } from "@/constants";
import { test } from "./app_shell_silent_update_e2e.fixtures";
import {
  checkForNewBuild,
  deployClockOf,
  entryScriptOf,
  hasWaitingBuild,
} from "./silentUpdatePage";
import { SiteBuild } from "./silentUpdateSite";

const { Given, When, Then } = createBdd(test);

const NOTICES_REGION_SELECTOR = 'footer [role="status"]';
const DEPLOY_TIME_SELECTOR = "[data-deploy-time]";
const UPDATE_NOTICE_TEXT = "A new version is available.";
const RELOAD_BUTTON_NAME = "Reload";
const SETTINGS_BUTTON_NAME = "Settings";
const CHECK_TIMEOUT_MS = 20_000;
const RESTART_ATTEMPT_COUNT = 10;
const RESTART_PAUSE_MS = 1000;
const RECHECK_FAST_FORWARD = "16:00";
const ZONE_RULES_NOTICE_PATTERN = /Time zone rules .* are ready/;
Given(
  "build A of the app is running and controls the page",
  async ({ smokeWorld, silentUpdateSite }) => {
    const { page } = smokeWorld;
    silentUpdateSite.serve(SiteBuild.A);
    await page.goto(silentUpdateSite.appUrl);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await expect
      .poll(() =>
        page.evaluate(() => navigator.serviceWorker.controller !== null),
      )
      .toBe(true);
    expect(await entryScriptOf(page)).toBe(
      silentUpdateSite.describe(SiteBuild.A).entryScriptUrl,
    );
  },
);

Given(
  /^the system prefers the (light|dark) color scheme for the update notice$/,
  async ({ smokeWorld }, colorScheme: "light" | "dark") => {
    await smokeWorld.page.emulateMedia({ colorScheme });
  },
);

// The page is controlled by a service worker, whose requests the page routes do not see: the site itself names the release.
// A return to the page after 16 minutes starts the recheck.
Given(
  "a newer zone rules release is published and the app checks for it",
  async ({ smokeWorld, silentUpdateSite }) => {
    const { page } = smokeWorld;
    silentUpdateSite.publishNewerZoneRules();
    await page.clock.install();
    await page.clock.fastForward(RECHECK_FAST_FORWARD);
    await page.evaluate(() =>
      document.dispatchEvent(new Event("visibilitychange")),
    );
  },
);

// The app reads the app revision file once it knows that a build waits: that request is the proof.
Given(
  "a data-only build is published and waiting",
  async ({ smokeWorld, silentUpdateSite }) => {
    const { page } = smokeWorld;
    const revisionRead = page.waitForResponse((response) =>
      response.url().endsWith(APP_REVISION_FILE),
    );
    silentUpdateSite.serve(SiteBuild.SILENT);
    await checkForNewBuild(page);
    await revisionRead;
    expect(await hasWaitingBuild(page)).toBe(true);
  },
);

// The app reads the app revision file once it knows that a build waits: wait for that read, so the empty region is not asserted too early.
When(
  "a data-only build is published and the app checks for a new build",
  async ({ smokeWorld, silentUpdateSite }) => {
    const { page } = smokeWorld;
    const revisionRead = page.waitForResponse((response) =>
      response.url().endsWith(APP_REVISION_FILE),
    );
    silentUpdateSite.serve(SiteBuild.SILENT);
    await checkForNewBuild(page);
    await revisionRead;
  },
);

When(
  "a build with another app revision is published and the app checks for a new build",
  async ({ smokeWorld, silentUpdateSite }) => {
    silentUpdateSite.serve(SiteBuild.APP_CHANGE);
    await checkForNewBuild(smokeWorld.page);
  },
);

When("the user reloads the page", async ({ smokeWorld }) => {
  await smokeWorld.page.reload();
});

// Every window closed: the waiting build takes over when the app starts again.
When(
  "every window of the app is closed and the app is started again",
  async ({ smokeWorld, silentUpdateSite }) => {
    const context = smokeWorld.page.context();
    const waitingEntryScript = silentUpdateSite.describe(
      SiteBuild.SILENT,
    ).entryScriptUrl;
    for (let attempt = 0; attempt < RESTART_ATTEMPT_COUNT; attempt += 1) {
      await Promise.all(context.pages().map((openPage) => openPage.close()));
      smokeWorld.page = await context.newPage();
      await smokeWorld.page.goto(silentUpdateSite.appUrl);
      if ((await entryScriptOf(smokeWorld.page)) === waitingEntryScript) return;
      await smokeWorld.page.waitForTimeout(RESTART_PAUSE_MS);
    }
  },
);

When(
  "the user chooses Reload on the zone rules update notice",
  async ({ smokeWorld, silentUpdateSite }) => {
    const { page } = smokeWorld;
    const zoneRulesNotice = page.getByText(ZONE_RULES_NOTICE_PATTERN);
    await expect(zoneRulesNotice).toBeVisible({ timeout: CHECK_TIMEOUT_MS });
    const waitingEntryScript = silentUpdateSite.describe(
      SiteBuild.SILENT,
    ).entryScriptUrl;
    const reloaded = page.waitForEvent("load");
    await page.getByRole("button", { name: RELOAD_BUTTON_NAME }).click();
    await reloaded;
    await expect
      .poll(() => entryScriptOf(page), { timeout: CHECK_TIMEOUT_MS })
      .toBe(waitingEntryScript);
  },
);

Then("the data-only build is waiting", async ({ smokeWorld }) => {
  await expect
    .poll(() => hasWaitingBuild(smokeWorld.page), {
      timeout: CHECK_TIMEOUT_MS,
    })
    .toBe(true);
});

Then("the notices region stays empty", async ({ smokeWorld }) => {
  await expect(smokeWorld.page.locator(NOTICES_REGION_SELECTOR)).toBeEmpty();
});

Then(
  "the update notice is shown with a reload action",
  async ({ smokeWorld }) => {
    const { page } = smokeWorld;
    await expect(page.getByText(UPDATE_NOTICE_TEXT)).toBeVisible({
      timeout: CHECK_TIMEOUT_MS,
    });
    await expect(
      page.getByRole("button", { name: RELOAD_BUTTON_NAME }),
    ).toBeVisible();
  },
);

Then("the app still runs build A", async ({ smokeWorld, silentUpdateSite }) => {
  expect(await entryScriptOf(smokeWorld.page)).toBe(
    silentUpdateSite.describe(SiteBuild.A).entryScriptUrl,
  );
});

Then("the app runs build A", async ({ smokeWorld, silentUpdateSite }) => {
  expect(await entryScriptOf(smokeWorld.page)).toBe(
    silentUpdateSite.describe(SiteBuild.A).entryScriptUrl,
  );
});

Then(
  "the app runs the data-only build",
  async ({ smokeWorld, silentUpdateSite }) => {
    expect(await entryScriptOf(smokeWorld.page)).toBe(
      silentUpdateSite.describe(SiteBuild.SILENT).entryScriptUrl,
    );
  },
);

Then(
  "the settings page names the deploy time of the data-only build",
  async ({ smokeWorld, silentUpdateSite }) => {
    const { page } = smokeWorld;
    await page.getByRole("button", { name: SETTINGS_BUTTON_NAME }).click();
    await expect(page.locator(DEPLOY_TIME_SELECTOR)).toContainText(
      deployClockOf(silentUpdateSite.describe(SiteBuild.SILENT).deployInstant),
    );
  },
);

Then(
  "axe-core finds no violations with the update notice shown",
  async ({ smokeWorld }) => {
    const accessibilityScan = await new AxeBuilder({
      page: smokeWorld.page,
    }).analyze();
    expect(accessibilityScan.violations).toEqual([]);
  },
);
