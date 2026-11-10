import { defineConfig, devices } from "@playwright/test";
import { cucumberReporter, defineBddConfig } from "playwright-bdd";
import {
  APP_BASE_PATH,
  DEPLOY_INSTANT_DEFINE,
  E2E_PORT,
  TEST_DEPLOY_INSTANT,
} from "./app.config";
import type { ContractViewOptions } from "./src/test/features/view_contract/steps/view_contract_e2e.fixtures";

/**
 * The step files import `@/constants`, which reads the deploy instant that Vite
 * defines in a build. Playwright has no Vite, so it gets the test instant.
 * Implements FR6 of polish-settings-and-remove-offline-update-notice (D1).
 */
Object.assign(globalThis, { [DEPLOY_INSTANT_DEFINE]: TEST_DEPLOY_INSTANT });

/**
 * E2E runs against `vite preview` of the production build, because the
 * service worker only exists there.
 * Implements FR1 of setup-app-shell-and-pages-deploy (D1, D3).
 */
const testDir = defineBddConfig({
  features: "src/test/features/**/*_e2e.feature",
  steps: "src/test/features/**/steps/*_e2e.{steps,fixtures}.ts",
  featuresRoot: "./src/test/features",
  outputDir: ".features-gen",
});

/**
 * Loaded at run time: the annotation keeps `tsc` from following the import
 * into `src/views/`, which the node project cannot type-check (D12).
 */
const VIEW_REGISTRY_MODULE_PATH: string = "./src/views/index.ts";
const CONSTANTS_MODULE_PATH: string = "./src/constants/index.ts";
const PREFERENCES_MODULE_PATH: string = "./src/preferences/index.ts";
const { viewRegistry } = await import(VIEW_REGISTRY_MODULE_PATH);
const { STORAGE_KEYS, PREFERENCES_SCHEMA_VERSION } = await import(
  CONSTANTS_MODULE_PATH
);
const { DEFAULT_PREFERENCES } = await import(PREFERENCES_MODULE_PATH);
const VIEW_CONTRACT_TAG_PATTERN = /@view-contract/;
/**
 * A contract scenario of a capability: it runs for the views whose registry
 * entry shows the meeting range and for no other view.
 * Implements FR17 of add-grid-meeting-range-and-share (D11).
 */
const MEETING_RANGE_CONTRACT_TAG_PATTERN = /@meeting-range(?![\w-])/;
/**
 * The scenarios a view cannot pass yet, excluded for that view only; the tag
 * names the change that brings the scenario back (ADR-0012).
 * Implements FR8 of add-view-mode-setting-and-grid-skeleton (D5).
 * Implements FR13 of add-grid-hour-cells-and-hour-frame (D4): no scenario is excluded today.
 */
const VIEW_CONTRACT_PENDING_TAGS: Partial<Record<string, RegExp>> = {};
/**
 * One set of baselines serves macOS, Linux and CI. Chromium rasterizes text
 * and focus rings differently on each; on 2026-10-01 the widest macOS-vs-Linux
 * gap was 1.31% of the pixels (the suggestions state at 375 px). A broken
 * layout changes far more than this ratio.
 */
const SCREENSHOT_MAX_DIFF_PIXEL_RATIO = 0.025;
const SCREENSHOT_PATH_TEMPLATE =
  "src/test/features/__screenshots__/{projectName}/{arg}{ext}";

const E2E_ORIGIN = `http://localhost:${E2E_PORT}`;
const E2E_APP_URL = `${E2E_ORIGIN}${APP_BASE_PATH}`;
const E2E_TEST_TIMEOUT_MS = 60_000;
const E2E_DEVICE_TIME_ZONE = "Asia/Almaty";
const BUILD_AND_PREVIEW_TIMEOUT_MS = 180_000;
const CI_RETRY_COUNT = 2;
const CI_WORKER_COUNT = 1;

/** Optional override for environments where Playwright's own Chromium is missing. */
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const isCi = !!process.env.CI;

/**
 * One contract run per registered view; registering a view adds its run. Each
 * run shows its view through the stored view mode, not through the viewport.
 * A view without `showsMeetingRange` leaves out the `@meeting-range` scenarios.
 * Implements FR17 of add-grid-meeting-range-and-share (D11).
 */
const viewContractProjects = viewRegistry.map(
  (view: { id: string; showsMeetingRange?: boolean }) => ({
    name: `view-contract-${view.id}`,
    grep: VIEW_CONTRACT_TAG_PATTERN,
    grepInvert: [
      VIEW_CONTRACT_PENDING_TAGS[view.id],
      view.showsMeetingRange === true
        ? undefined
        : MEETING_RANGE_CONTRACT_TAG_PATTERN,
    ].filter((pattern) => pattern !== undefined),
    use: {
      ...devices["Desktop Chrome"],
      contractView: {
        id: view.id,
        preferencesStorageKey: STORAGE_KEYS.PREFERENCES,
        preferencesDocument: JSON.stringify({
          schemaVersion: PREFERENCES_SCHEMA_VERSION,
          payload: { ...DEFAULT_PREFERENCES, viewMode: view.id },
        }),
      },
    },
  }),
);

export default defineConfig<ContractViewOptions>({
  testDir,
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? CI_RETRY_COUNT : 0,
  workers: isCi ? CI_WORKER_COUNT : undefined,
  reporter: [
    ["html", { open: "never" }],
    cucumberReporter("html", { outputFile: "cucumber-report/index.html" }),
  ],
  timeout: E2E_TEST_TIMEOUT_MS,
  snapshotPathTemplate: SCREENSHOT_PATH_TEMPLATE,
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: SCREENSHOT_MAX_DIFF_PIXEL_RATIO },
  },
  use: {
    baseURL: E2E_APP_URL,
    timezoneId: E2E_DEVICE_TIME_ZONE,
    trace: "on-first-retry",
    launchOptions: chromiumExecutablePath
      ? { executablePath: chromiumExecutablePath }
      : undefined,
  },
  projects: [
    {
      name: "chromium",
      grepInvert: VIEW_CONTRACT_TAG_PATTERN,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      grepInvert: VIEW_CONTRACT_TAG_PATTERN,
      use: { ...devices["Pixel 5"] },
    },
    ...viewContractProjects,
  ],
  webServer: {
    command: `pnpm build && pnpm preview --port ${E2E_PORT} --strictPort`,
    url: E2E_APP_URL,
    timeout: BUILD_AND_PREVIEW_TIMEOUT_MS,
    reuseExistingServer: !isCi,
  },
});
