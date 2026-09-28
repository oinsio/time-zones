import { defineConfig, devices } from "@playwright/test";
import { cucumberReporter, defineBddConfig } from "playwright-bdd";
import { APP_BASE_PATH, E2E_PORT } from "./app.config";

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

const E2E_ORIGIN = `http://localhost:${E2E_PORT}`;
const E2E_APP_URL = `${E2E_ORIGIN}${APP_BASE_PATH}`;
const E2E_TEST_TIMEOUT_MS = 60_000;
const BUILD_AND_PREVIEW_TIMEOUT_MS = 180_000;
const CI_RETRY_COUNT = 2;
const CI_WORKER_COUNT = 1;

/** Optional override for environments where Playwright's own Chromium is missing. */
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const isCi = !!process.env.CI;

export default defineConfig({
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
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm preview --port ${E2E_PORT} --strictPort`,
    url: E2E_APP_URL,
    timeout: BUILD_AND_PREVIEW_TIMEOUT_MS,
    reuseExistingServer: !isCi,
  },
});
