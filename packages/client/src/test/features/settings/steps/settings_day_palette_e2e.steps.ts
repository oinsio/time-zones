// Verifies FR1, FR5, UX2, NFR-A1, NFR-A3, NFR-R1 of redesign-cards-grid-and-day-palettes.
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import {
  readThemeColours,
  type Theme,
} from "../../main_page/steps/themeTokens";
import { RADIO_ROLE, RADIOGROUP_ROLE } from "./settingsE2eHelpers";

const { When, Then } = createBdd(test);

const COLOURS_GROUP_NAME = /^(Colours|Цвета)$/;
const COLOURING_GROUP_NAME = /^(Colouring|Раскраска)$/;
const WORKING_HOURS_GROUP_NAME = /^(Working hours|Рабочие часы)$/;
const SWATCH_SIZE_PX = 24;
const STRIPE_COUNT = 4;
const STRIPE_WIDTH_TOLERANCE_PX = 1;
const MIN_OPTION_SIZE_PX = 44;
const MAX_COMPACT_ROW_HEIGHT_PX = 56;
const GROUP_POSITION_TOLERANCE_PX = 1;
const TAB_KEY = "Tab";
const MAX_TAB_PRESSES = 40;
const STRIPE_SELECTOR = "span.overflow-hidden > span";
const SWATCH_SELECTOR = "span.overflow-hidden";
const GROUP_SELECTOR = "main > [role=radiogroup]";

const coloursGroup = (page: Page) =>
  page.getByRole(RADIOGROUP_ROLE, { name: COLOURS_GROUP_NAME });
const colouringGroup = (page: Page) =>
  page.getByRole(RADIOGROUP_ROLE, { name: COLOURING_GROUP_NAME });
const labelOf = (page: Page, name: string) =>
  coloursGroup(page).locator("label", {
    has: page.getByRole(RADIO_ROLE, { name, exact: true }),
  });

/** Top edge of every option group down to and including the colouring group. */
const readTopsAboveColours = (page: Page): Promise<number[]> =>
  page.evaluate(
    ({ selector, colouringPattern }) => {
      const groups = Array.from(document.querySelectorAll(selector));
      const colouringIndex = groups.findIndex((group) =>
        new RegExp(colouringPattern).test(
          document.getElementById(group.getAttribute("aria-labelledby") ?? "")
            ?.textContent ?? "",
        ),
      );
      return groups
        .slice(0, colouringIndex + 1)
        .map((group) => group.getBoundingClientRect().top + window.scrollY);
    },
    { selector: GROUP_SELECTOR, colouringPattern: COLOURING_GROUP_NAME.source },
  );

const notedTopsByPage = new WeakMap<Page, number[]>();

When(
  "the user notes the positions of the groups down to the colouring group",
  async ({ locationsWorld }) => {
    notedTopsByPage.set(
      locationsWorld.page,
      await readTopsAboveColours(locationsWorld.page),
    );
  },
);

Then(
  "the groups down to the colouring group keep their positions",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect(colouringGroup(page)).toBeVisible();
    const notedTops = notedTopsByPage.get(page) ?? [];
    const tops = await readTopsAboveColours(page);
    expect(tops).toHaveLength(notedTops.length);
    tops.forEach((top, index) =>
      expect(Math.abs(top - notedTops[index])).toBeLessThanOrEqual(
        GROUP_POSITION_TOLERANCE_PX,
      ),
    );
  },
);

Then("the Colours group is shown", async ({ locationsWorld }) => {
  await expect(coloursGroup(locationsWorld.page)).toBeVisible();
});

Then(
  "the option {string} of the Colours group is checked",
  async ({ locationsWorld }, name: string) => {
    await expect(
      coloursGroup(locationsWorld.page).getByRole(RADIO_ROLE, { name }),
    ).toBeChecked();
  },
);

Then(
  "the swatch of {string} starts with {string} and the swatch of {string} with {string}",
  async (
    { locationsWorld },
    vividName: string,
    vividHex: string,
    mutedName: string,
    mutedHex: string,
  ) => {
    for (const [name, hex] of [
      [vividName, vividHex],
      [mutedName, mutedHex],
    ]) {
      await expect(
        labelOf(locationsWorld.page, name).locator(STRIPE_SELECTOR).first(),
      ).toHaveCSS("background-color", hexToComputedRgb(hex));
    }
  },
);

const HEX_RADIX = 16;
const hexToComputedRgb = (hex: string): string =>
  `rgb(${[1, 3, 5]
    .map((start) => Number.parseInt(hex.slice(start, start + 2), HEX_RADIX))
    .join(", ")})`;

Then(
  "each swatch is 24 by 24 px with four stripes of equal width",
  async ({ locationsWorld }) => {
    for (const name of ["Vivid", "Muted"]) {
      const label = labelOf(locationsWorld.page, name);
      const swatchBox = await label.locator(SWATCH_SELECTOR).boundingBox();
      expect(swatchBox?.width).toBe(SWATCH_SIZE_PX);
      expect(swatchBox?.height).toBe(SWATCH_SIZE_PX);
      const stripes = label.locator(STRIPE_SELECTOR);
      await expect(stripes).toHaveCount(STRIPE_COUNT);
      for (const stripe of await stripes.all()) {
        const stripeBox = await stripe.boundingBox();
        expect(
          Math.abs((stripeBox?.width ?? 0) - SWATCH_SIZE_PX / STRIPE_COUNT),
        ).toBeLessThanOrEqual(STRIPE_WIDTH_TOLERANCE_PX);
      }
    }
  },
);

When("the user tabs to the Colours group", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const radios = coloursGroup(page).getByRole(RADIO_ROLE);
  for (let pressCount = 0; pressCount < MAX_TAB_PRESSES; pressCount += 1) {
    await page.keyboard.press(TAB_KEY);
    if (
      await radios.evaluateAll((elements) =>
        elements.includes(document.activeElement as HTMLInputElement),
      )
    ) {
      return;
    }
  }
  throw new Error("the Colours group never received the focus");
});

Then(
  "the option {string} of the Colours group is checked and focused",
  async ({ locationsWorld }, name: string) => {
    const option = coloursGroup(locationsWorld.page).getByRole(RADIO_ROLE, {
      name,
    });
    await expect(option).toBeChecked();
    await expect(option).toBeFocused();
  },
);

Then(
  "the Colours group named {string} has the options {string} and {string}, each at least 44 by 44 px",
  async (
    { locationsWorld },
    groupName: string,
    first: string,
    second: string,
  ) => {
    const group = locationsWorld.page.getByRole(RADIOGROUP_ROLE, {
      name: groupName,
    });
    await expect(group.getByRole(RADIO_ROLE)).toHaveCount(2);
    for (const name of [first, second]) {
      const box = await labelOf(locationsWorld.page, name).boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(MIN_OPTION_SIZE_PX);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(MIN_OPTION_SIZE_PX);
    }
  },
);

Then(
  "no swatch is exposed to assistive technology",
  async ({ locationsWorld }) => {
    const swatches = coloursGroup(locationsWorld.page).locator(SWATCH_SELECTOR);
    expect(await swatches.count()).toBe(2);
    for (const swatch of await swatches.all()) {
      expect(
        await swatch.evaluate(
          (element) => element.closest("[aria-hidden=true]") !== null,
        ),
      ).toBe(true);
    }
  },
);

const rowHeightAndCaptionShare = async (group: Locator) => {
  const rowBox = await group.boundingBox();
  const captionBox = await group.locator("span").first().boundingBox();
  const controlsBox = await group.locator("label").first().boundingBox();
  expect(rowBox?.height ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(
    MAX_COMPACT_ROW_HEIGHT_PX,
  );
  expect(captionBox?.y ?? 0).toBeLessThan(
    (controlsBox?.y ?? 0) + (controlsBox?.height ?? 0),
  );
};

Then(
  "the colouring group and the row under it are each at most 56 px high with their caption and controls on one row",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await rowHeightAndCaptionShare(colouringGroup(page));
    const rowUnder = page
      .getByRole(RADIOGROUP_ROLE, { name: COLOURS_GROUP_NAME })
      .or(page.getByRole("group", { name: WORKING_HOURS_GROUP_NAME }));
    await expect(rowUnder).toBeVisible();
    const rowBox = await rowUnder.boundingBox();
    expect(rowBox?.height ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(
      MAX_COMPACT_ROW_HEIGHT_PX,
    );
  },
);

Then(
  /^the border of every option group's joined control is the (light|dark) control border$/,
  async ({ locationsWorld }, theme: Theme) => {
    const { border } = readThemeColours(theme);
    const joinedControls = locationsWorld.page.locator(
      `${GROUP_SELECTOR} > div`,
    );
    expect(await joinedControls.count()).toBeGreaterThan(0);
    for (const joinedControl of await joinedControls.all()) {
      await expect(joinedControl).toHaveCSS("border-top-color", border);
    }
  },
);
