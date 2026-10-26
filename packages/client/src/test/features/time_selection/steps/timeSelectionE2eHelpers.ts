import type { Locator, Page } from "@playwright/test";
import { listRow } from "../../locations/steps/locationsE2eHelpers";

export const ENGLISH_SLIDER_NAME_PREFIX = "Time in ";
export const SLIDER_ROLE = "slider";
export const HANDLE_SELECTOR = "[data-day-track-handle]";
export const BAR_SELECTOR = "[data-day-track-bar]";
export const HOUR_LABEL_SELECTOR = "[data-hour-label]";
const VISIBLE_HANDLE_SELECTOR = `${HANDLE_SELECTOR} > span`;
const TIME_TEXT_XPATH = "xpath=preceding-sibling::span";
const PERCENT = 100;
export const DRAG_STEPS = 10;
export const HALF = 2;

export type Box = { x: number; y: number; width: number; height: number };

export const sliderOf = (page: Page, city: string) =>
  page.getByRole(SLIDER_ROLE, { name: `${ENGLISH_SLIDER_NAME_PREFIX}${city}` });
export const allSliders = (page: Page) => page.getByRole(SLIDER_ROLE);
export const handleOf = (page: Page, city: string) =>
  sliderOf(page, city).locator(HANDLE_SELECTOR);
export const visibleHandleOf = (page: Page, city: string) =>
  sliderOf(page, city).locator(VISIBLE_HANDLE_SELECTOR);
export const barOf = (page: Page, city: string) =>
  sliderOf(page, city).locator(BAR_SELECTOR);
export const hourLabelsOf = (page: Page, city: string) =>
  listRow(page, city).locator(HOUR_LABEL_SELECTOR);
export const timeTextOf = (page: Page, city: string) =>
  listRow(page, city).locator("time").locator(TIME_TEXT_XPATH);

export async function requireBox(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  if (!box) throw new Error("The element has no bounding box");
  return box;
}

export const centreOfBox = (box: Box) => ({
  x: box.x + box.width / HALF,
  y: box.y + box.height / HALF,
});

/** The page point at a percentage of a city's bar, on the bar's centre line. */
export async function pointOnBar(page: Page, city: string, percent: number) {
  const box = await requireBox(barOf(page, city));
  return {
    x: box.x + (box.width * percent) / PERCENT,
    y: box.y + box.height / HALF,
  };
}

/**
 * The computed value of a CSS property when it is set to a design token, read
 * from a probe element so the check follows the active theme.
 */
export function readTokenStyle(
  page: Page,
  cssProperty: string,
  tokenVariable: string,
): Promise<string> {
  return page.evaluate(
    ({ property, variable }) => {
      const probe = document.createElement("span");
      probe.style.setProperty(property, `var(${variable})`);
      document.body.append(probe);
      const computed = getComputedStyle(probe).getPropertyValue(property);
      probe.remove();
      return computed;
    },
    { property: cssProperty, variable: tokenVariable },
  );
}

/** Presses the bar of a city at a percentage of its width, like a mouse click. */
export async function selectTrackFraction(
  page: Page,
  city: string,
  percent: number,
) {
  const point = await pointOnBar(page, city, percent);
  await page.mouse.click(point.x, point.y);
}
