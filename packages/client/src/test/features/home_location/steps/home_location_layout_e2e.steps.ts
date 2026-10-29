import { expect, type Locator } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { listRow, menuButton } from "../../locations/steps/locationsE2eHelpers";

const { Then } = createBdd(test);

const MIN_HIT_AREA_PX = 44;
const OFFSET_DIFFERENCE_SELECTOR = "[data-offset-difference][aria-hidden]";
const HERE_CAPTION = "here";

async function requireBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("The element has no box");
  return box;
}

// Verifies FR7, UX1 of set-home-location-and-show-differences.
Then(
  "the offset difference of {string} reads {string}",
  async ({ locationsWorld }, cityName: string, difference: string) => {
    await expect(
      listRow(locationsWorld.page, cityName).locator(
        OFFSET_DIFFERENCE_SELECTOR,
      ),
    ).toHaveText(difference);
  },
);

// Verifies UX1 of set-home-location-and-show-differences: reading order city, difference, caption.
Then(
  "the offset difference of {string} stands after the city and before the caption",
  async ({ locationsWorld }, cityName: string) => {
    const row = listRow(locationsWorld.page, cityName);
    const isInOrder = await row.evaluate(
      (rowElement, { city, differenceSelector, caption }) => {
        const [cityElement, differenceElement, captionElement] = [
          [...rowElement.querySelectorAll("span")].find(
            (element) => element.textContent === city,
          ),
          rowElement.querySelector(differenceSelector),
          [...rowElement.querySelectorAll("span")].find(
            (element) => element.textContent === caption,
          ),
        ];
        if (!cityElement || !differenceElement || !captionElement) return false;
        const isFollowing = (earlier: Element, later: Element) =>
          Boolean(
            earlier.compareDocumentPosition(later) &
              Node.DOCUMENT_POSITION_FOLLOWING,
          );
        return (
          isFollowing(cityElement, differenceElement) &&
          isFollowing(differenceElement, captionElement)
        );
      },
      {
        city: cityName,
        differenceSelector: OFFSET_DIFFERENCE_SELECTOR,
        caption: HERE_CAPTION,
      },
    );
    expect(isInOrder).toBe(true);
  },
);

// Verifies UX3 of set-home-location-and-show-differences.
Then(
  "the location menu button of {string} is at least 44 px wide and tall",
  async ({ locationsWorld }, cityName: string) => {
    const box = await requireBox(menuButton(locationsWorld.page, cityName));
    expect(box.width).toBeGreaterThanOrEqual(MIN_HIT_AREA_PX);
    expect(box.height).toBeGreaterThanOrEqual(MIN_HIT_AREA_PX);
  },
);
