import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { readThemeColours } from "../../main_page/steps/themeTokens";
import { requireBox } from "./hourGridE2eHelpers";
import { endHandleOf, startHandleOf } from "./meetingE2eHelpers";

const { When, Then } = createBdd(test);

const MIN_HANDLE_WIDTH_PX = 24;
const MIN_HANDLE_HEIGHT_PX = 44;

// Verifies FR12, NFR-A1 of add-grid-meeting-range-and-share.
Then(
  /^the slider "([^"]+)" has the value (\d+), the minimum (\d+), the maximum (\d+) and the value text "([^"]+)"$/,
  async (
    { locationsWorld },
    name: string,
    value: string,
    minimum: string,
    maximum: string,
    valueText: string,
  ) => {
    const slider = locationsWorld.page.getByRole("slider", { name });
    await expect(slider).toHaveAttribute("aria-valuenow", String(value));
    await expect(slider).toHaveAttribute("aria-valuemin", String(minimum));
    await expect(slider).toHaveAttribute("aria-valuemax", String(maximum));
    await expect(slider).toHaveAttribute("aria-valuetext", valueText);
  },
);

When(
  /^the user presses "([^"]+)" on the (start|end) handle$/,
  async ({ locationsWorld }, key: string, which: string) => {
    const { page } = locationsWorld;
    await (which === "start" ? startHandleOf(page) : endHandleOf(page)).press(
      key,
    );
  },
);

Then(
  "each handle is at least {int} by {int} px",
  async ({ locationsWorld }, width: number, height: number) => {
    expect([width, height]).toEqual([
      MIN_HANDLE_WIDTH_PX,
      MIN_HANDLE_HEIGHT_PX,
    ]);
    const { page } = locationsWorld;
    for (const handle of [startHandleOf(page), endHandleOf(page)]) {
      const box = await requireBox(handle);
      expect(box.width).toBeGreaterThanOrEqual(width);
      expect(box.height).toBeGreaterThanOrEqual(height);
    }
  },
);

Then(
  "a focused handle has a focus ring in the accent colour",
  async ({ locationsWorld }) => {
    const handle = startHandleOf(locationsWorld.page);
    await handle.focus();
    await expect(handle).toHaveCSS(
      "outline-color",
      readThemeColours("light").accent,
    );
  },
);
