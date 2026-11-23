// Verifies FR5, NFR-P1 of add-unix-time-converter-tool: the tool page chunk, the notices and the offline start.
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../app_shell/steps/app_shell_smoke_e2e.fixtures";
import {
  BACK_BUTTON_NAME,
  BUTTON_ROLE,
  openSettings,
  SETTINGS_BUTTON_NAME,
  settingsHeading,
} from "../../settings/steps/settingsE2eHelpers";

const { Given, When, Then } = createBdd(test);

const TOOL_NAME = /^(Unix time converter|Конвертер Unix-времени)$/;
const SCRIPT_URL_PATTERN = /\.js$/;
const NOTICE_TIMEOUT_MS = 15_000;
const NOTICE_TEXT_PATTERN = /Time zone rules .+ are ready/;
const APP_ROOT_URL = ".";

const scriptsByPage = new WeakMap<Page, string[]>();
const initialScriptsByPage = new WeakMap<Page, string[]>();

const toolButton = (page: Page) =>
  page.getByRole(BUTTON_ROLE, { name: TOOL_NAME });

const turnToolOnAndGoBack = async (page: Page) => {
  await openSettings(page);
  await toolButton(page).click();
  await page.getByRole(BUTTON_ROLE, { name: BACK_BUTTON_NAME }).click();
  await expect(settingsHeading(page)).toBeHidden();
};

Given(
  "the script requests of the page are recorded",
  async ({ smokeWorld }) => {
    const requestedScripts: string[] = [];
    scriptsByPage.set(smokeWorld.page, requestedScripts);
    smokeWorld.page.on("request", (pageRequest) => {
      const { pathname } = new URL(pageRequest.url());
      if (SCRIPT_URL_PATTERN.test(pathname)) requestedScripts.push(pathname);
    });
  },
);

When("the user opens the app with no tool enabled", async ({ smokeWorld }) => {
  await smokeWorld.page.goto(APP_ROOT_URL);
  await expect(smokeWorld.page.getByRole("main")).toBeVisible();
});

Then(
  "the scripts of the app are recorded as the initial scripts",
  async ({ smokeWorld }) => {
    const initialScripts = [...(scriptsByPage.get(smokeWorld.page) ?? [])];
    expect(initialScripts.length).toBeGreaterThan(0);
    initialScriptsByPage.set(smokeWorld.page, initialScripts);
  },
);

When(
  "the user turns the tool on and chooses its button",
  async ({ smokeWorld }) => {
    await turnToolOnAndGoBack(smokeWorld.page);
    await toolButton(smokeWorld.page).click();
  },
);

Then(
  "a script that was not among the initial scripts is requested",
  async ({ smokeWorld }) => {
    const { page } = smokeWorld;
    await expect(page.getByRole("heading", { name: TOOL_NAME })).toBeVisible();
    const initialScripts = initialScriptsByPage.get(page) ?? [];
    const laterScripts = (scriptsByPage.get(page) ?? []).filter(
      (pathname) => !initialScripts.includes(pathname),
    );
    expect(laterScripts.length).toBeGreaterThan(0);
  },
);

Then(
  "the zone rules update notice is announced on the tool page",
  async ({ smokeWorld }) => {
    const { page } = smokeWorld;
    await expect(page.getByRole("heading", { name: TOOL_NAME })).toBeVisible();
    await expect(page.getByText(NOTICE_TEXT_PATTERN)).toBeVisible({
      timeout: NOTICE_TIMEOUT_MS,
    });
  },
);

Given(
  "the tool is turned on and the app is reloaded",
  async ({ smokeWorld }) => {
    await turnToolOnAndGoBack(smokeWorld.page);
    await smokeWorld.page.reload();
    await expect(toolButton(smokeWorld.page)).toBeVisible();
  },
);

When("the user goes offline and reopens the app", async ({ smokeWorld }) => {
  await smokeWorld.page.context().setOffline(true);
  await smokeWorld.page.reload();
  await expect(
    smokeWorld.page.getByRole(BUTTON_ROLE, { name: SETTINGS_BUTTON_NAME }),
  ).toBeVisible();
});

When(
  "the user chooses the tool button of the offline app",
  async ({ smokeWorld }) => {
    await toolButton(smokeWorld.page).click();
  },
);

Then(
  "the tool page heading is shown in the offline app",
  async ({ smokeWorld }) => {
    await expect(
      smokeWorld.page.getByRole("heading", { name: TOOL_NAME }),
    ).toBeVisible();
  },
);
