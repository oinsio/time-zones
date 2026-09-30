import type { Page, Route } from "@playwright/test";
import { test as base } from "playwright-bdd";

const CARDS_CHUNK_URL_PATTERN = /\/CardsView-[^/]+\.js$/;

const rejectServiceWorkerUpdates = () => {
  ServiceWorkerRegistration.prototype.update = () =>
    Promise.reject(
      new TypeError("Failed to update a ServiceWorker: network error"),
    );
};

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * State of one main page scenario: the page under test, the requests held or
 * blocked on purpose and the recorded header position.
 * Verifies FR1, FR6 of add-main-page-scaffold.
 */
export class MainPageWorld {
  recordedHeaderBox: BoundingBox | undefined;
  private readonly heldRoutes: Route[] = [];

  constructor(readonly page: Page) {}

  /** Keeps every request for the Cards chunk pending until the scenario ends. */
  async holdCardsChunk() {
    await this.page.route(CARDS_CHUNK_URL_PATTERN, (route) => {
      this.heldRoutes.push(route);
    });
  }

  /** Makes every request for the Cards chunk fail. */
  async blockCardsChunk() {
    await this.page.route(CARDS_CHUNK_URL_PATTERN, (route) => route.abort());
  }

  async unblockCardsChunk() {
    await this.page.unroute(CARDS_CHUNK_URL_PATTERN);
  }

  /**
   * Makes every later page load see its update check reject, as a browser does
   * when the network is unreachable. Playwright cannot fail the browser's own
   * service worker script fetch, so the rejection is injected at the API.
   */
  async failUpdateChecksOnNextLoad() {
    await this.page.addInitScript(rejectServiceWorkerUpdates);
  }

  async releaseHeldRequests() {
    for (const heldRoute of this.heldRoutes) {
      await heldRoute.continue().catch(() => undefined);
    }
  }
}

export const test = base.extend<{ mainPageWorld: MainPageWorld }>({
  mainPageWorld: async ({ page }, use) => {
    const mainPageWorld = new MainPageWorld(page);
    await use(mainPageWorld);
    await mainPageWorld.releaseHeldRequests();
  },
});
