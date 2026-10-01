import { defineConfig, devices } from "@playwright/test";
import { cucumberReporter, defineBddConfig } from "playwright-bdd";
import { APP_BASE_PATH, E2E_PORT } from "./app.config";
import type { ContractViewOptions } from "./src/test/features/view_contract/steps/view_contract_e2e.fixtures";
import { getContractViewportWidth } from "./src/test/viewContractViewport";

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
const { viewRegistry } = await import(VIEW_REGISTRY_MODULE_PATH);
const VIEW_CONTRACT_TAG_PATTERN = /@view-contract/;
const SCREENSHOT_MAX_DIFF_PIXEL_RATIO = 0.01;
const SCREENSHOT_PATH_TEMPLATE =
  "src/test/features/__screenshots__/{projectName}/{arg}{ext}";
/**
 * Screenshot scenarios run only inside the pinned Playwright image
 * (`pnpm test:screenshots`, which sets E2E_SCREENSHOTS): Chromium rasterizes
 * text and focus rings differently on every OS and distro, so one set of
 * baselines holds only where the renderer is the same everywhere.
 */
const SCREENSHOT_TAG_PATTERN = /@screenshot/;
const isScreenshotRun = !!process.env.E2E_SCREENSHOTS;
const browserGrepInvert = isScreenshotRun
  ? VIEW_CONTRACT_TAG_PATTERN
  : [VIEW_CONTRACT_TAG_PATTERN, SCREENSHOT_TAG_PATTERN];

const E2E_ORIGIN = `http://localhost:${E2E_PORT}`;
const E2E_APP_URL = `${E2E_ORIGIN}${APP_BASE_PATH}`;
const E2E_TEST_TIMEOUT_MS = 60_000;
const BUILD_AND_PREVIEW_TIMEOUT_MS = 180_000;
const CI_RETRY_COUNT = 2;
const CI_WORKER_COUNT = 1;

/** Optional override for environments where Playwright's own Chromium is missing. */
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const isCi = !!process.env.CI;

/** One contract run per registered view; registering a view adds its run. */
const viewContractProjects = viewRegistry.map(
  (view: { id: string; autoMinWidth: number }) => ({
    name: `view-contract-${view.id}`,
    grep: VIEW_CONTRACT_TAG_PATTERN,
    use: {
      ...devices["Desktop Chrome"],
      contractView: {
        id: view.id,
        viewportWidth: getContractViewportWidth(view, viewRegistry),
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
    trace: "on-first-retry",
    launchOptions: chromiumExecutablePath
      ? { executablePath: chromiumExecutablePath }
      : undefined,
  },
  projects: [
    {
      name: "chromium",
      grepInvert: browserGrepInvert,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      grepInvert: browserGrepInvert,
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
