// Verifies FR4, FR7, FR8, NFR-A2, NFR-R1 of refine-meeting-range-entry-and-handles: the handles in reach, in a real browser.
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { DATE_BAR_SELECTOR } from "@/constants";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { dismissOfflineReadyNotice } from "../../time_selection/steps/timeSelectionE2eHelpers";
import { cellOf, centreOf, requireBox } from "./hourGridE2eHelpers";
import { endHandleOf, startHandleOf } from "./meetingE2eHelpers";

const { When, Then } = createBdd(test);

const MIN_HIT_AREA_PX = 44;
const DRAG_STEP_COUNT = 8;
const PAGE_POSITIONS = {
  top: 0,
  middle: 0.5,
  bottom: 1,
} as const;
type PagePosition = keyof typeof PAGE_POSITIONS;
const handleItemOf = (page: Page, which: "start" | "end") =>
  (which === "start" ? startHandleOf(page) : endHandleOf(page)).locator(
    "xpath=..",
  );
const cellPitchOf = async (page: Page) =>
  (await requireBox(cellOf(page, "Almaty", 1))).x -
  (await requireBox(cellOf(page, "Almaty", 0))).x;

When(
  /^the page is scrolled to its (top|middle|bottom)$/,
  async ({ locationsWorld }, position: PagePosition) => {
    await dismissOfflineReadyNotice(locationsWorld.page);
    await locationsWorld.page.evaluate((fraction) => {
      const scrollRange =
        document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, scrollRange * fraction);
    }, PAGE_POSITIONS[position]);
    await locationsWorld.page.waitForTimeout(0);
  },
);

Then(
  "both meeting handles lie fully inside the viewport and above the date bar",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const viewport = page.viewportSize();
    const barBox = await requireBox(page.locator(DATE_BAR_SELECTOR));
    for (const which of ["start", "end"] as const) {
      await expect
        .poll(
          async () => {
            const box = await requireBox(handleItemOf(page, which));
            return (
              box.y >= 0 &&
              box.y + box.height <= barBox.y &&
              box.x >= 0 &&
              box.x + box.width <= (viewport?.width ?? 0)
            );
          },
          { message: `the ${which} handle is on screen` },
        )
        .toBe(true);
    }
  },
);

When(
  /^the user presses the mouse (\d+) px right of the end handle's centre, moves it one cell to the right and releases it over an hour cell of "([^"]+)"$/,
  async ({ locationsWorld }, offsetPx: string, city: string) => {
    const { page } = locationsWorld;
    const handleCentre = centreOf(await requireBox(endHandleOf(page)));
    const pressX = handleCentre.x + Number(offsetPx);
    const releaseY = centreOf(await requireBox(cellOf(page, city, 0))).y;
    await page.mouse.move(pressX, handleCentre.y);
    await page.mouse.down();
    await page.mouse.move(pressX + (await cellPitchOf(page)), releaseY, {
      steps: DRAG_STEP_COUNT,
    });
    await page.mouse.up();
  },
);

When(
  /^the user presses the end handle (\d+) px right of its centre and releases it without moving$/,
  async ({ locationsWorld }, offsetPx: string) => {
    const { page } = locationsWorld;
    const handleCentre = centreOf(await requireBox(endHandleOf(page)));
    await page.mouse.move(handleCentre.x + Number(offsetPx), handleCentre.y);
    await page.mouse.down();
    await page.mouse.up();
  },
);

Then(
  /^the (start|end) handle has a hit area of at least 44 by 44 px$/,
  async ({ locationsWorld }, which: "start" | "end") => {
    const box = await requireBox(handleItemOf(locationsWorld.page, which));
    expect(box.width).toBeGreaterThanOrEqual(MIN_HIT_AREA_PX);
    expect(box.height).toBeGreaterThanOrEqual(MIN_HIT_AREA_PX);
  },
);

Then(
  /^the (start|end) handle has the value (\d+) minutes, shown as "([^"]+)", between (\d+) and (\d+)$/,
  async (
    { locationsWorld },
    which: "start" | "end",
    value: string,
    text: string,
    minimum: string,
    maximum: string,
  ) => {
    const slider = (which === "start" ? startHandleOf : endHandleOf)(
      locationsWorld.page,
    );
    await expect(slider).toHaveAttribute("aria-valuenow", String(value));
    await expect(slider).toHaveAttribute("aria-valuetext", text);
    await expect(slider).toHaveAttribute("aria-valuemin", String(minimum));
    await expect(slider).toHaveAttribute("aria-valuemax", String(maximum));
  },
);

When(
  "the user presses ArrowRight on the start handle and ArrowLeft on the end handle",
  async ({ locationsWorld }) => {
    await startHandleOf(locationsWorld.page).press("ArrowRight");
    await endHandleOf(locationsWorld.page).press("ArrowLeft");
  },
);
