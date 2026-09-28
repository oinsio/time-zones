import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  APP_BASE_PATH,
  APP_NAME,
  APP_SHORT_NAME,
  APP_THEME_COLOR,
} from "../../../../../app.config";
import { test } from "./app_shell_smoke_e2e.fixtures";

const { Given, When, Then } = createBdd(test);

const APP_ROOT_URL = ".";
const STANDALONE_DISPLAY = "standalone";
const MASKABLE_PURPOSE = "maskable";
const REQUIRED_ICON_SIZES = ["192x192", "512x512"];
const MASKABLE_ICON_SIZE = "512x512";
const IMAGE_CONTENT_TYPE_PREFIX = "image/";
const HEAD_ICON_SELECTOR = 'link[rel="icon"], link[rel="apple-touch-icon"]';
const MANIFEST_LINK_SELECTOR = 'link[rel="manifest"]';
const SCREEN_HEIGHT_PX = 800;

type ManifestIcon = { src: string; sizes: string; purpose?: string };

// Verifies FR1 of setup-app-shell-and-pages-deploy: the app opens under its sub-path.
When("the user opens the app", async ({ smokeWorld }) => {
  await smokeWorld.page.goto(APP_ROOT_URL);
});

// Verifies FR5, NFR-A1 of setup-app-shell-and-pages-deploy: the service worker
// has precached the build and controls the page.
Given("the user has visited the app once", async ({ smokeWorld }) => {
  const { page } = smokeWorld;
  await page.goto(APP_ROOT_URL);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
});

// Verifies FR5, M3 of setup-app-shell-and-pages-deploy.
When("the user reopens the app without network", async ({ smokeWorld }) => {
  const { page } = smokeWorld;
  await page.context().setOffline(true);
  await page.reload();
});

// Verifies FR2 of setup-app-shell-and-pages-deploy.
Given(
  "the user's browser language is {string}",
  async ({ smokeWorld }, browserLanguage: string) => {
    await smokeWorld.useBrowserLanguage(browserLanguage);
  },
);

// Verifies NFR-A3 of setup-app-shell-and-pages-deploy.
Given(
  /^the system prefers the (light|dark) color scheme$/,
  async ({ smokeWorld }, colorScheme: "light" | "dark") => {
    await smokeWorld.page.emulateMedia({ colorScheme });
  },
);

// Verifies NFR-R1 of setup-app-shell-and-pages-deploy.
Given(
  "the screen is {int} px wide",
  async ({ smokeWorld }, screenWidth: number) => {
    await smokeWorld.page.setViewportSize({
      width: screenWidth,
      height: SCREEN_HEIGHT_PX,
    });
  },
);

// Verifies FR1, FR2 of setup-app-shell-and-pages-deploy.
Then(
  "the page heading reads {string}",
  async ({ smokeWorld }, expectedTitle: string) => {
    await expect(smokeWorld.page.getByRole("heading", { level: 1 })).toHaveText(
      expectedTitle,
    );
  },
);

// Verifies FR2 of setup-app-shell-and-pages-deploy.
Then(
  "the document title reads {string}",
  async ({ smokeWorld }, expectedTitle: string) => {
    await expect(smokeWorld.page).toHaveTitle(expectedTitle);
  },
);

// Verifies FR2 of setup-app-shell-and-pages-deploy.
Then(
  "the page language is {string}",
  async ({ smokeWorld }, expectedLanguage: string) => {
    await expect(smokeWorld.page.locator("html")).toHaveAttribute(
      "lang",
      expectedLanguage,
    );
  },
);

// Verifies FR1 of setup-app-shell-and-pages-deploy.
Then("no resource request has failed", async ({ smokeWorld }) => {
  await smokeWorld.page.waitForLoadState("networkidle");
  expect(smokeWorld.failedRequests).toEqual([]);
});

// Verifies FR1 of setup-app-shell-and-pages-deploy.
Then(
  "the service worker scope is the app base path",
  async ({ smokeWorld }) => {
    const serviceWorkerScope = await smokeWorld.page.evaluate(
      async () => (await navigator.serviceWorker.ready).scope,
    );
    expect(new URL(serviceWorkerScope).pathname).toBe(APP_BASE_PATH);
  },
);

// Verifies FR3 of setup-app-shell-and-pages-deploy.
Then(
  "the app manifest describes an installable app",
  async ({ smokeWorld }) => {
    const manifestUrl = await readManifestUrl(smokeWorld.page);
    const manifestResponse = await smokeWorld.page.request.get(manifestUrl);
    const manifest = await manifestResponse.json();
    const icons: ManifestIcon[] = manifest.icons;

    expect(manifest).toMatchObject({
      name: APP_NAME,
      short_name: APP_SHORT_NAME,
      display: STANDALONE_DISPLAY,
      start_url: APP_BASE_PATH,
      scope: APP_BASE_PATH,
      theme_color: APP_THEME_COLOR,
    });
    for (const requiredSize of REQUIRED_ICON_SIZES) {
      expect(icons.map((icon) => icon.sizes)).toContain(requiredSize);
    }
    expect(icons).toContainEqual(
      expect.objectContaining({
        sizes: MASKABLE_ICON_SIZE,
        purpose: MASKABLE_PURPOSE,
      }),
    );
  },
);

// Verifies FR3 of setup-app-shell-and-pages-deploy.
Then("every icon of the app is reachable", async ({ smokeWorld }) => {
  const { page } = smokeWorld;
  const manifestUrl = await readManifestUrl(page);
  const manifest = await (await page.request.get(manifestUrl)).json();
  const manifestIconUrls = (manifest.icons as ManifestIcon[]).map(
    (icon) => new URL(icon.src, manifestUrl).href,
  );
  const headIconUrls = await page
    .locator(HEAD_ICON_SELECTOR)
    .evaluateAll((iconLinks) =>
      iconLinks.map((iconLink) => (iconLink as HTMLLinkElement).href),
    );
  expect(headIconUrls.length).toBeGreaterThan(0);

  for (const iconUrl of [...manifestIconUrls, ...headIconUrls]) {
    const iconResponse = await page.request.get(iconUrl);
    expect(iconResponse.ok(), iconUrl).toBe(true);
    expect(iconResponse.headers()["content-type"], iconUrl).toContain(
      IMAGE_CONTENT_TYPE_PREFIX,
    );
  }
});

// Verifies NFR-A1, NFR-A3, M2 of setup-app-shell-and-pages-deploy.
Then("the page has no accessibility violations", async ({ smokeWorld }) => {
  const accessibilityScan = await new AxeBuilder({
    page: smokeWorld.page,
  }).analyze();
  expect(accessibilityScan.violations).toEqual([]);
});

// Verifies NFR-R1 of setup-app-shell-and-pages-deploy.
Then("the page does not scroll horizontally", async ({ smokeWorld }) => {
  const pageWidths = await smokeWorld.page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(pageWidths.scrollWidth).toBeLessThanOrEqual(pageWidths.clientWidth);
});

async function readManifestUrl(page: Page): Promise<string> {
  const manifestHref = await page
    .locator(MANIFEST_LINK_SELECTOR)
    .getAttribute("href");
  expect(manifestHref).not.toBeNull();
  return new URL(manifestHref as string, page.url()).href;
}
