// Verifies FR17, NFR-A2, NFR-A3, NFR-R1, NFR-R2 of add-unix-time-converter-tool: touch focus, messages, long values, screenshots.
import { devices, expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { seedPreferenceFields } from "../../settings/steps/settingsE2eHelpers";
import {
  converterInput,
  enableToolInSettings,
  notationsOf,
  pasteIntoConverterInput,
  toolButton,
  toolHeading,
} from "./converterE2eHelpers";

const { Given, When, Then } = createBdd(test);

const PIXEL_DEVICE = devices["Pixel 5"];
const APP_ROOT_URL = ".";
const LIVE_REGION_SELECTOR = "[aria-live], [role='status']";
const LIVE_TICK_COUNT = 3;
const TICK_INTERVAL_MS = 1000;
const MESSAGE_PATTERN = /Unix|ISO 8601/;
const HOUR_FORMAT_12 = "H12";
const NOTICES_HIDDEN_STYLE = "footer > [role='status'] { visibility: hidden; }";
const MUTATION_COUNT_KEY = "converterLiveRegionMutations";

const touchPages = new WeakMap<object, Page>();
const touchPageOf = (world: object) => {
  const page = touchPages.get(world);
  if (page === undefined) throw new Error("no touch device page was opened");
  return page;
};

Given(
  "the device has a coarse pointer that cannot hover and the tool is enabled",
  async ({ locationsWorld }) => {
    const browserInstance = locationsWorld.page.context().browser();
    if (browserInstance === null) throw new Error("no browser");
    const context = await browserInstance.newContext({
      ...PIXEL_DEVICE,
      baseURL: test.info().project.use.baseURL,
      timezoneId: test.info().project.use.timezoneId,
    });
    const page = await context.newPage();
    touchPages.set(locationsWorld, page);
    await page.goto(APP_ROOT_URL);
    await enableToolInSettings(page);
  },
);

When(
  "the user opens the converter on that device",
  async ({ locationsWorld }) => {
    await toolButton(touchPageOf(locationsWorld)).click();
    await expect(toolHeading(touchPageOf(locationsWorld))).toBeVisible();
  },
);

Then(
  "the focus is on the page heading and no field is focused",
  async ({ locationsWorld }) => {
    const page = touchPageOf(locationsWorld);
    await expect(toolHeading(page)).toBeFocused();
    await expect(converterInput(page)).not.toBeFocused();
  },
);

When(
  "the user chooses the converter input of that device and pastes {string}",
  async ({ locationsWorld }, text: string) => {
    const page = touchPageOf(locationsWorld);
    await converterInput(page).click();
    await pasteIntoConverterInput(page, text);
  },
);

Then(
  "the converter input of that device shows exactly {string}",
  async ({ locationsWorld }, text: string) => {
    const page = touchPageOf(locationsWorld);
    await expect(converterInput(page)).toHaveValue(text);
    await page.context().close();
  },
);

When(
  "the user starts watching the live regions",
  async ({ locationsWorld }) => {
    await locationsWorld.page.evaluate(
      ({ selector, key }) => {
        const counter = { count: 0 };
        (window as unknown as Record<string, unknown>)[key] = counter;
        const observer = new MutationObserver(() => {
          counter.count += 1;
        });
        for (const region of document.querySelectorAll(selector)) {
          observer.observe(region, {
            childList: true,
            characterData: true,
            subtree: true,
          });
        }
      },
      { selector: LIVE_REGION_SELECTOR, key: MUTATION_COUNT_KEY },
    );
  },
);

Then(
  "the message is announced politely and the input refers to it as its description",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const field = converterInput(page);
    const messageId = await field.getAttribute("aria-describedby");
    expect(messageId).not.toBeNull();
    const message = page.locator(`[id="${messageId}"]`);
    await expect(message).toHaveAttribute("aria-live", "polite");
    await expect(message).toHaveText(MESSAGE_PATTERN);
  },
);

When("the live converter ticks three times", async ({ locationsWorld }) => {
  await locationsWorld.page.evaluate((key) => {
    (window as unknown as Record<string, { count: number }>)[key].count = 0;
  }, MUTATION_COUNT_KEY);
  await locationsWorld.page.waitForTimeout(LIVE_TICK_COUNT * TICK_INTERVAL_MS);
});

Then("nothing is announced", async ({ locationsWorld }) => {
  const mutationCount = await locationsWorld.page.evaluate(
    (key) =>
      (window as unknown as Record<string, { count: number }>)[key].count,
    MUTATION_COUNT_KEY,
  );
  expect(mutationCount).toBe(0);
});

Given(
  "the hour format is 12-hour in the browser",
  async ({ locationsWorld }) => {
    await seedPreferenceFields(
      locationsWorld.page,
      { hourFormat: HOUR_FORMAT_12 },
      locationsWorld.seededInterfaceLanguage,
    );
  },
);

Then(
  "the time {string} and the notation {string} are fully visible",
  async ({ locationsWorld }, time: string, notation: string) => {
    const { page } = locationsWorld;
    await expectFullyVisible(page.getByText(time, { exact: true }));
    await expectFullyVisible(
      notationsOf(page).getByText(notation, { exact: true }),
    );
  },
);

Then(
  "the converter input text and the nanoseconds notation {string} are fully visible",
  async ({ locationsWorld }, notation: string) => {
    const { page } = locationsWorld;
    const field = converterInput(page);
    const isTextClipped = await field.evaluate(
      (element: HTMLInputElement) => element.scrollWidth > element.clientWidth,
    );
    expect(isTextClipped).toBe(false);
    await expectFullyVisible(field);
    await expectFullyVisible(
      notationsOf(page).getByText(notation, { exact: true }),
    );
  },
);

const expectFullyVisible = async (locator: ReturnType<Page["locator"]>) => {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  const viewportWidth = locator.page().viewportSize()?.width ?? 0;
  expect(box).not.toBeNull();
  expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewportWidth);
};

Then(
  "the converter matches the approved screenshot",
  async ({ locationsWorld, $test }) => {
    const screenshotName = `Converter-${$test.info().title}`.replace(
      /[^A-Za-z0-9]+/g,
      "-",
    );
    await locationsWorld.page.addStyleTag({ content: NOTICES_HIDDEN_STYLE });
    await expect(locationsWorld.page).toHaveScreenshot(`${screenshotName}.png`);
  },
);
