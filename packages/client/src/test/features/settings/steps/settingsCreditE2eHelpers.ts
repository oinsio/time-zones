import type { Page } from "@playwright/test";
import { GNOMISH_FACTORY_LANDING_URL } from "@/constants";

export const LINK_ROLE = "link";
export const LANDING_ORIGIN_PATTERN = "https://oinsio.github.io/**";
export const LANDING_STUB_HTML =
  "<!doctype html><title>Gnomish Factory</title>";
export const MUTED_FOREGROUND_TOKEN = "--color-muted-foreground";
export const ACCENT_TOKEN = "--color-accent";
export const COLOR_PROPERTY = "color";
export const OUTLINE_COLOR_PROPERTY = "outline-color";
export const NO_OUTLINE_STYLE = "none";
export const UNDERLINE = "underline";
export const SHIFT_TAB_KEY = "Shift+Tab";
export const ENTER_KEY = "Enter";
export const CENTRE_TOLERANCE_PX = 1;

/** The tab and the address left by the last follow of the credit, per page. */
export const creditPopups = new WeakMap<Page, Page>();
export const settingsUrlBeforeCredit = new WeakMap<Page, string>();

export const creditOf = (page: Page) =>
  page.locator(`a[href="${GNOMISH_FACTORY_LANDING_URL}"]`);

export const stubLandingPage = (page: Page) =>
  page
    .context()
    .route(LANDING_ORIGIN_PATTERN, (route) =>
      route.fulfill({ contentType: "text/html", body: LANDING_STUB_HTML }),
    );

export const boxOf = async (locator: ReturnType<Page["locator"]>) => {
  const box = await locator.boundingBox();
  if (box === null) throw new Error("element has no box");
  return box;
};

export const readStyle = (page: Page, property: string) =>
  creditOf(page).evaluate(
    (element, cssProperty) =>
      getComputedStyle(element).getPropertyValue(cssProperty),
    property,
  );

export async function followCredit(page: Page, activate: () => Promise<void>) {
  await stubLandingPage(page);
  const popupPromise = page.waitForEvent("popup");
  await activate();
  return popupPromise;
}

/** The back button is named «Назад» in Russian, so scenarios in both languages find it. */
export const ANY_LANGUAGE_BACK_BUTTON_NAME = /^(Back|Назад)$/;

/** Measures the credit: its text is neither clipped nor pushed past the viewport. */
export async function measureCreditFit(page: Page) {
  const credit = creditOf(page);
  const { scrollWidth, clientWidth } = await credit.evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));
  const box = await boxOf(credit);
  return {
    isClipped: scrollWidth > clientWidth,
    isInsideViewport:
      box.x >= 0 && box.x + box.width <= (page.viewportSize()?.width ?? 0),
  };
}
