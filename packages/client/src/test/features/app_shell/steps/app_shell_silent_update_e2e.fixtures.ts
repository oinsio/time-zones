import { resolve } from "node:path";
import { test as smokeTest } from "./app_shell_smoke_e2e.fixtures";
import {
  type SilentUpdateSite,
  startSilentUpdateSite,
} from "./silentUpdateSite";

const CLIENT_ROOT = resolve(import.meta.dirname, "../../../../..");
const SITE_BUILD_TIMEOUT_MS = 900_000;

/**
 * The silent update scenarios run on sites of their own: build A, a silent
 * build B and an app-change build B, built once per worker (design D8).
 * Implements FR3, FR4, FR11 of apply-data-updates-silently.
 */
export const test = smokeTest.extend<
  Record<never, never>,
  { silentUpdateSite: SilentUpdateSite }
>({
  silentUpdateSite: [
    // Playwright reads the dependencies of a fixture from its first parameter, which must be destructured.
    async ({ playwright: _playwright }, use, workerInfo) => {
      const site = await startSilentUpdateSite(
        CLIENT_ROOT,
        workerInfo.parallelIndex,
      );
      await use(site);
      await site.stop();
    },
    { scope: "worker", timeout: SITE_BUILD_TIMEOUT_MS },
  ],
});
