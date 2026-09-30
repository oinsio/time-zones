import type { Page, Route } from "@playwright/test";
import { LOCATIONS_SCHEMA_VERSION, STORAGE_KEYS } from "@/constants";
import { test as contractTest } from "../../view_contract/steps/view_contract_e2e.fixtures";

const SEARCH_DATA_URL_PATTERN = /\/city-search-[^/]+\.json$/;

export type StoredLocation = {
  timeZoneId: string;
  label: string;
  countryCode: string;
};

/**
 * State of one locations scenario: the stored list seeded before the app
 * starts, storage made to fail, and the search data request held, aborted or
 * let through.
 * Verifies FR13, FR15, NFR-R2 of add-locations-via-search (D8, D12).
 */
export class LocationsWorld {
  private readonly heldRoutes: Route[] = [];

  constructor(readonly page: Page) {}

  /** Seeds a version-1 document once, before the app reads it. */
  async seedList(locations: StoredLocation[]) {
    await this.seedDocument(
      JSON.stringify({
        schemaVersion: LOCATIONS_SCHEMA_VERSION,
        payload: { locations },
      }),
    );
  }

  /** Seeds raw text, for documents the app cannot read. */
  async seedDocument(documentText: string) {
    await this.page.addInitScript(
      ({ key, text }) => {
        if (window.localStorage.getItem(key) === null) {
          window.localStorage.setItem(key, text);
        }
      },
      { key: STORAGE_KEYS.LOCATIONS, text: documentText },
    );
  }

  /** Every write to storage throws, as in some private modes. */
  async failAllStorageWrites() {
    await this.page.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException("quota", "QuotaExceededError");
      };
    });
  }

  /** Keeps the search data request pending until released. */
  async holdSearchData() {
    await this.page.route(SEARCH_DATA_URL_PATTERN, (route) => {
      this.heldRoutes.push(route);
    });
  }

  /** Makes the search data request fail. */
  async failSearchData() {
    await this.page.route(SEARCH_DATA_URL_PATTERN, (route) => route.abort());
  }

  /** Lets later search data requests through to the network. */
  async allowSearchData() {
    await this.page.unroute(SEARCH_DATA_URL_PATTERN);
  }

  async releaseHeldRequests() {
    for (const heldRoute of this.heldRoutes) {
      await heldRoute.continue().catch(() => undefined);
    }
  }
}

export const test = contractTest.extend<{ locationsWorld: LocationsWorld }>({
  locationsWorld: async ({ page }, use) => {
    const locationsWorld = new LocationsWorld(page);
    await use(locationsWorld);
    await locationsWorld.releaseHeldRequests();
  },
});
