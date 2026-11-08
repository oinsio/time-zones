import type { Page } from "@playwright/test";
import { GNOMISH_FACTORY_LANDING_URL } from "@/constants";
import { RADIOGROUP_ROLE } from "./settingsE2eHelpers";

export const LINK_ROLE = "link";
export const LANDING_ORIGIN_PATTERN = "https://oinsio.github.io/**";
export const LANDING_STUB_HTML =
  "<!doctype html><title>Gnomish Factory</title>";
export const ACCENT_TOKEN = "--color-accent";
export const COLOR_PROPERTY = "color";
export const OUTLINE_COLOR_PROPERTY = "outline-color";
export const NO_OUTLINE_STYLE = "none";
export const UNDERLINE = "underline";
export const SHIFT_TAB_KEY = "Shift+Tab";
export const ENTER_KEY = "Enter";
export const CENTRE_TOLERANCE_PX = 1;
export const FORMER_CREDIT_FONT_SIZE_PX = 14;
export const MIN_CREDIT_FONT_SIZE_RATIO = 1.15;
export const MAX_CREDIT_FONT_SIZE_RATIO = 1.2;
export const TAB_KEY = "Tab";
const ANY_LANGUAGE_THEME_GROUP_NAME = /^(Theme|Тема)$/;

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

export const themeGroupOf = (page: Page) =>
  page.getByRole(RADIOGROUP_ROLE, { name: ANY_LANGUAGE_THEME_GROUP_NAME });

// Verifies FR5, FR6 of compact-settings-controls: an unchecked option keeps the accent icon colour.
export const themeIconOf = (page: Page) =>
  themeGroupOf(page).locator("label:has(input:not(:checked)) svg").first();

// Verifies FR5, FR6 of compact-settings-controls: the caption is the visible name of the group.
export const themeCaptionOf = (page: Page) =>
  themeGroupOf(page).locator(":scope > span").first();

export const readThemeIconColour = (page: Page) =>
  themeIconOf(page).evaluate((element) =>
    getComputedStyle(element).getPropertyValue("color"),
  );

export async function readCreditFontSizeRatio(page: Page) {
  const fontSizePx = await creditOf(page).evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize),
  );
  return fontSizePx / FORMER_CREDIT_FONT_SIZE_PX;
}

// Verifies FR5, FR6 of compact-settings-controls: the theme radiogroup is the next sibling or inside it, named by its caption.
export const isCreditDirectlyAboveThemeGroup = (page: Page) =>
  creditOf(page).evaluate(
    (element, { groupRole, themeNamePattern }) => {
      const themeNameRegExp = new RegExp(themeNamePattern);
      const nextElement = element.nextElementSibling;
      const groupSelector = `[role="${groupRole}"]`;
      const groups = nextElement?.matches(groupSelector)
        ? [nextElement]
        : Array.from(nextElement?.querySelectorAll(groupSelector) ?? []);
      return groups.some((group) => {
        const captionId = group.getAttribute("aria-labelledby") ?? "";
        const captionText = document.getElementById(captionId)?.textContent;
        return themeNameRegExp.test(captionText ?? "");
      });
    },
    {
      groupRole: RADIOGROUP_ROLE,
      themeNamePattern: ANY_LANGUAGE_THEME_GROUP_NAME.source,
    },
  );
