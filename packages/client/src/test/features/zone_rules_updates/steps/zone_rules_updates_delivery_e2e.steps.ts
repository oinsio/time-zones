import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { LOCATIONS_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
import { test } from "../../app_shell/steps/app_shell_smoke_e2e.fixtures";
import {
  countVersionFileRequests,
  publishNewerRelease,
  readBundledReleaseName,
} from "./zoneRulesPublishedFiles";

const { Given, When, Then } = createBdd(test);

const SERVICE_WORKER_URL = "sw.js";
const VERSION_FILE_URL = "zone-rules/version.json";
const RELEASE_FILE_DIRECTORY = "zone-rules/";
const SETTINGS_BUTTON_NAME = "Settings";
const BUTTON_ROLE = "button";
const NOTICE_TIMEOUT_MS = 15_000;
const ALMATY_STORED_LOCATION = {
  timeZoneId: "Asia/Almaty",
  label: "Almaty",
  countryCode: "KZ",
};
const ALMATY_PUBLISHED_OFFSET_TEXT = "UTC+4";

let publishedRelease = "";
let readVersionFileRequestCount: () => number = () => 0;
let versionFileRequestsBeforeOffline = 0;

// Verifies FR2, NFR-P1 of add-remote-zone-rules-updates: the built site serves both files.
Then(
  "the site serves the zone rules version file and the bundled release file",
  async ({ smokeWorld }) => {
    const { page } = smokeWorld;
    const bundledRelease = readBundledReleaseName();
    const versionResponse = await page.request.get(VERSION_FILE_URL);
    expect(versionResponse.ok()).toBe(true);
    expect((await versionResponse.json()).release).toBe(bundledRelease);
    const releaseResponse = await page.request.get(
      `${RELEASE_FILE_DIRECTORY}${bundledRelease}.json`,
    );
    expect(releaseResponse.ok()).toBe(true);
    expect((await releaseResponse.json()).release).toBe(bundledRelease);
  },
);

// Verifies FR2, NFR-P1 of add-remote-zone-rules-updates: neither file is in the precache.
Then("the service worker precaches neither of them", async ({ smokeWorld }) => {
  const serviceWorkerText = await (
    await smokeWorld.page.request.get(SERVICE_WORKER_URL)
  ).text();
  expect(serviceWorkerText).not.toContain(VERSION_FILE_URL);
  expect(serviceWorkerText).not.toContain(
    `${RELEASE_FILE_DIRECTORY}${readBundledReleaseName()}.json`,
  );
});

Given("the user has a location in Almaty", async ({ smokeWorld }) => {
  await smokeWorld.page.addInitScript(
    ({ key, document }) => {
      if (window.localStorage.getItem(key) === null) {
        window.localStorage.setItem(key, document);
      }
    },
    {
      key: STORAGE_KEYS.LOCATIONS,
      document: JSON.stringify({
        schemaVersion: LOCATIONS_SCHEMA_VERSION,
        payload: { locations: [ALMATY_STORED_LOCATION], homeLocationId: null },
      }),
    },
  );
});

// Verifies FR4, G2 of add-remote-zone-rules-updates: the site answers with a newer release whose Almaty rule is UTC+4.
Given(
  "a newer zone rules release is published for delivery",
  async ({ smokeWorld }) => {
    publishedRelease = await publishNewerRelease(smokeWorld.page);
  },
);

When(
  "the user reloads after the zone rules update notice appears",
  async ({ smokeWorld }) => {
    const { page } = smokeWorld;
    await expect(
      page.getByText(
        new RegExp(`Time zone rules ${publishedRelease} are ready`),
      ),
    ).toBeVisible({ timeout: NOTICE_TIMEOUT_MS });
    await page.reload();
  },
);

// Verifies FR6, G2, M2 of add-remote-zone-rules-updates: the stored release is active after the reload.
Then(
  "the settings page names the published release",
  async ({ smokeWorld }) => {
    const { page } = smokeWorld;
    await expect(page.getByText(ALMATY_PUBLISHED_OFFSET_TEXT)).toBeVisible({
      timeout: NOTICE_TIMEOUT_MS,
    });
    await page.getByRole(BUTTON_ROLE, { name: SETTINGS_BUTTON_NAME }).click();
    await expect(
      page.getByText(`Time zone rules: ${publishedRelease}`),
    ).toBeVisible();
    await page.getByRole(BUTTON_ROLE, { name: "Back" }).click();
  },
);

Then("the Almaty location shows UTC+4", async ({ smokeWorld }) => {
  await expect(
    smokeWorld.page.getByText(ALMATY_PUBLISHED_OFFSET_TEXT),
  ).toBeVisible();
});

Given(
  "the zone rules version file requests are counted",
  async ({ smokeWorld }) => {
    readVersionFileRequestCount = countVersionFileRequests(smokeWorld.page);
  },
);

When("the user goes offline and reloads the app", async ({ smokeWorld }) => {
  const { page } = smokeWorld;
  versionFileRequestsBeforeOffline = readVersionFileRequestCount();
  await page.context().setOffline(true);
  await page.reload();
});

// Verifies FR4, FR6 of add-remote-zone-rules-updates: offline, the app starts and asks nothing.
Then(
  "no zone rules version file was requested after going offline",
  async () => {
    expect(readVersionFileRequestCount()).toBe(
      versionFileRequestsBeforeOffline,
    );
  },
);
