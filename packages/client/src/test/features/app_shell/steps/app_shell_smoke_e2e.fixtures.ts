import type { Browser, Page, TestInfo } from "@playwright/test";
import { test as base } from "playwright-bdd";

const FIRST_HTTP_ERROR_STATUS = 400;

/**
 * State of one smoke scenario: the page under test and every request that
 * failed while it was open.
 * Verifies FR1, FR2 of setup-app-shell-and-pages-deploy.
 */
export class SmokeWorld {
  readonly failedRequests: string[] = [];
  page: Page;

  constructor(
    page: Page,
    private readonly browser: Browser,
    private readonly testInfo: TestInfo,
  ) {
    this.page = page;
    this.trackFailedRequests(page);
  }

  /** Replaces the page with one whose browser reports the given language. */
  async useBrowserLanguage(browserLanguage: string) {
    const projectOptions = this.testInfo.project.use;
    const localizedContext = await this.browser.newContext({
      baseURL: projectOptions.baseURL,
      viewport: projectOptions.viewport,
      userAgent: projectOptions.userAgent,
      deviceScaleFactor: projectOptions.deviceScaleFactor,
      isMobile: projectOptions.isMobile,
      hasTouch: projectOptions.hasTouch,
      locale: browserLanguage,
    });
    this.page = await localizedContext.newPage();
    this.trackFailedRequests(this.page);
  }

  private trackFailedRequests(page: Page) {
    page.on("requestfailed", (failedRequest) => {
      this.failedRequests.push(`${failedRequest.url()} (network error)`);
    });
    page.on("response", (response) => {
      if (response.status() >= FIRST_HTTP_ERROR_STATUS) {
        this.failedRequests.push(`${response.url()} (${response.status()})`);
      }
    });
  }
}

export const test = base.extend<{ smokeWorld: SmokeWorld }>({
  smokeWorld: async ({ page, browser, $testInfo }, use) => {
    const smokeWorld = new SmokeWorld(page, browser, $testInfo);
    await use(smokeWorld);
    if (smokeWorld.page !== page) {
      await smokeWorld.page.context().close();
    }
  },
});
