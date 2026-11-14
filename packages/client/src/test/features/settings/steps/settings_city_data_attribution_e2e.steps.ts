import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { GEONAMES_URL } from "@/constants";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  boxOf,
  LINK_ROLE,
  settingsUrlBeforeCredit,
  TAB_KEY,
} from "./settingsCreditE2eHelpers";
import { MIN_OPTION_HEIGHT_PX } from "./settingsE2eHelpers";

const { Given, When, Then } = createBdd(test);

const GEONAMES_ORIGIN_PATTERN = "https://www.geonames.org/**";
const GEONAMES_STUB_HTML = "<!doctype html><title>GeoNames</title>";
const GEONAMES_HOST_SUFFIX = "geonames.org";
const MAX_TAB_PRESSES = 60;

const attributionOf = (page: Page) => page.locator(`a[href="${GEONAMES_URL}"]`);

/** The tab opened by the last follow of the attribution, and the requests to GeoNames, per page. */
const attributionPopups = new WeakMap<Page, Page>();
const geoNamesRequests = new WeakMap<Page, string[]>();

// Verifies FR13, UX4 of add-geonames-city-source: the page shows the attribution link.
Then(
  "the settings page shows the link {string} to GeoNames",
  async ({ locationsWorld }, attributionText: string) => {
    const attribution = locationsWorld.page.getByRole(LINK_ROLE, {
      name: attributionText,
      exact: true,
    });
    await expect(attribution).toHaveAttribute("href", GEONAMES_URL);
    await expect(attribution).toHaveAttribute("target", "_blank");
    await expect(attribution).toHaveAttribute("rel", "noopener noreferrer");
  },
);

// Verifies FR13, UX4 of add-geonames-city-source: a new tab, the app stays.
When(
  "the user follows the city data attribution",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    // The shared step "the settings page is still shown" compares with this address.
    settingsUrlBeforeCredit.set(page, page.url());
    await page
      .context()
      .route(GEONAMES_ORIGIN_PATTERN, (route) =>
        route.fulfill({ contentType: "text/html", body: GEONAMES_STUB_HTML }),
      );
    const popupPromise = page.waitForEvent("popup");
    await attributionOf(page).click();
    attributionPopups.set(page, await popupPromise);
  },
);

Then(
  "a new tab opens at the GeoNames home page",
  async ({ locationsWorld }) => {
    const popup = attributionPopups.get(locationsWorld.page);
    if (popup === undefined) throw new Error("no tab was opened");
    await expect(popup).toHaveURL(GEONAMES_URL);
  },
);

// Verifies FR13 of add-geonames-city-source: the attribution is plain text offline and asks nothing of GeoNames.
Given("requests to geonames.org are recorded", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const requestUrls: string[] = [];
  geoNamesRequests.set(page, requestUrls);
  page.context().on("request", (pageRequest) => {
    if (new URL(pageRequest.url()).hostname.endsWith(GEONAMES_HOST_SUFFIX)) {
      requestUrls.push(pageRequest.url());
    }
  });
});

Then(
  "the city data attribution is {string}",
  async ({ locationsWorld }, attributionText: string) => {
    await expect(attributionOf(locationsWorld.page)).toHaveText(
      attributionText,
    );
  },
);

Then("no request to geonames.org was made", ({ locationsWorld }) => {
  expect(geoNamesRequests.get(locationsWorld.page)).toEqual([]);
});

// Verifies NFR-A2 of add-geonames-city-source: the attribution is a keyboard stop after the last control.
When(
  "the user tabs to the city data attribution",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    for (let pressCount = 0; pressCount < MAX_TAB_PRESSES; pressCount += 1) {
      await page.keyboard.press(TAB_KEY);
      if (
        await attributionOf(page).evaluate(
          (link) => link === document.activeElement,
        )
      ) {
        return;
      }
    }
    throw new Error("the attribution never got the keyboard focus");
  },
);

Then("the city data attribution has the focus", async ({ locationsWorld }) => {
  await expect(attributionOf(locationsWorld.page)).toBeFocused();
});

Then(
  "the city data attribution is at least 44 px high",
  async ({ locationsWorld }) => {
    const box = await boxOf(attributionOf(locationsWorld.page));
    expect(box.height).toBeGreaterThanOrEqual(MIN_OPTION_HEIGHT_PX);
  },
);

Then(
  "the city data attribution is the last Tab stop",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await page.keyboard.press(TAB_KEY);
    await expect(attributionOf(page)).not.toBeFocused();
  },
);

// Verifies NFR-R2 of add-geonames-city-source: the text is not cut off.
Then(
  "the city data attribution text is shown in full",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const attribution = attributionOf(page);
    const { scrollWidth, clientWidth } = await attribution.evaluate(
      (element) => ({
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      }),
    );
    const box = await boxOf(attribution);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(
      page.viewportSize()?.width ?? 0,
    );
  },
);
