// Verifies FR1, FR2, FR4, FR5, NFR-A1, NFR-A2, NFR-A3, NFR-R1, UX1, UX2, M1, M2, M3 of compact-settings-controls.
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { readThemeColours } from "../../main_page/steps/themeTokens";
import {
  BACK_BUTTON_NAME,
  BUTTON_ROLE,
  RADIO_ROLE,
  RADIOGROUP_ROLE,
} from "./settingsE2eHelpers";

const { Given, When, Then } = createBdd(test);

const THEME_GROUP_NAME = /^(Theme|Тема)$/;
const HOUR_FORMAT_GROUP_NAME = /^(Hour format|Формат времени)$/;
const VIEW_GROUP_NAME = /^(View|Вид)$/;
const GROUP_NAMES = {
  theme: THEME_GROUP_NAME,
  "hour format": HOUR_FORMAT_GROUP_NAME,
  view: VIEW_GROUP_NAME,
} as const;
type GroupKind = keyof typeof GROUP_NAMES;
const THEME_ICON_CLASSES = ["lucide-monitor", "lucide-sun", "lucide-moon"];
const MIN_TAB_PRESSES = 40;
const TAB_KEY = "Tab";
const NO_OUTLINE_STYLE = "none";
const HIDDEN_FROM_USERS_SELECTOR = "[aria-hidden='true']";

const groupOf = (page: Page, kind: GroupKind) =>
  page.getByRole(RADIOGROUP_ROLE, { name: GROUP_NAMES[kind] });
const labelsOf = (group: Locator) =>
  group.locator("label").filter({ has: group.page().getByRole(RADIO_ROLE) });
const quotedNamesOf = (quotedNames: string) =>
  [...quotedNames.matchAll(/"([^"]+)"/g)].map((match) => match[1]);

/** The text a sighted user reads in a label: everything but the screen-reader-only name. */
const readVisibleText = (label: Locator) =>
  label.evaluate((element) => {
    const copy = element.cloneNode(true) as HTMLElement;
    for (const hidden of copy.querySelectorAll(".sr-only, input")) {
      hidden.remove();
    }
    return (copy.textContent ?? "").trim();
  });

const readNames = async (group: Locator) => {
  const names: string[] = [];
  for (const label of await labelsOf(group).all()) {
    names.push(
      (await label.locator("span.sr-only").textContent())?.trim() ?? "",
    );
  }
  return names;
};

Then(
  /^the (theme|hour format) options are named (.+), in this order$/,
  async ({ locationsWorld }, kind: GroupKind, quotedNames: string) => {
    const group = groupOf(locationsWorld.page, kind);
    expect(await readNames(group)).toEqual(quotedNamesOf(quotedNames));
    for (const name of quotedNamesOf(quotedNames)) {
      await expect(
        group.getByRole(RADIO_ROLE, { name, exact: true }),
      ).toHaveCount(1);
    }
  },
);

Then(
  "the theme options show the monitor, the sun and the moon icon and no visible text",
  async ({ locationsWorld }) => {
    const labels = await labelsOf(groupOf(locationsWorld.page, "theme")).all();
    expect(labels).toHaveLength(THEME_ICON_CLASSES.length);
    for (const [index, label] of labels.entries()) {
      await expect(
        label.locator(`svg.${THEME_ICON_CLASSES[index]}`),
      ).toHaveCount(1);
      expect(await readVisibleText(label)).toBe("");
    }
  },
);

Then(
  "every option has a pointer hint equal to its name",
  async ({ locationsWorld }) => {
    for (const kind of Object.keys(GROUP_NAMES) as GroupKind[]) {
      const group = groupOf(locationsWorld.page, kind);
      const names = await readNames(group);
      const labels = await labelsOf(group).all();
      for (const [index, label] of labels.entries()) {
        await expect(label).toHaveAttribute("title", names[index]);
      }
    }
  },
);

Then(
  "the hour format options show {string} and {string}, in this order",
  async ({ locationsWorld }, twelve: string, twentyFour: string) => {
    const labels = await labelsOf(
      groupOf(locationsWorld.page, "hour format"),
    ).all();
    const pictograms: string[] = [];
    for (const label of labels) {
      pictograms.push(
        (await label.locator(HIDDEN_FROM_USERS_SELECTOR).textContent()) ?? "",
      );
      expect(await readVisibleText(label)).toBe(pictograms.at(-1));
    }
    expect(pictograms).toEqual([twelve, twentyFour]);
  },
);

Then(
  "every theme, hour format and view option is at least {int} by {int} px",
  async ({ locationsWorld }, minWidth: number, minHeight: number) => {
    for (const kind of Object.keys(GROUP_NAMES) as GroupKind[]) {
      for (const label of await labelsOf(
        groupOf(locationsWorld.page, kind),
      ).all()) {
        const box = await label.boundingBox();
        expect(box?.width ?? 0).toBeGreaterThanOrEqual(minWidth);
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(minHeight);
      }
    }
  },
);

Then(
  /^the checked options are filled with the accent colour and the unchecked options with the (light|dark) surface colour$/,
  async ({ locationsWorld }, theme: "light" | "dark") => {
    const { page } = locationsWorld;
    const accentColour = await page
      .getByRole(BUTTON_ROLE, { name: BACK_BUTTON_NAME })
      .locator("svg")
      .evaluate((element) => getComputedStyle(element).color);
    const surfaceColour = readThemeColours(theme).surface;
    for (const kind of Object.keys(GROUP_NAMES) as GroupKind[]) {
      const group = groupOf(page, kind);
      for (const label of await labelsOf(group).all()) {
        const isChecked = await label.getByRole(RADIO_ROLE).isChecked();
        await expect(label).toHaveCSS(
          "background-color",
          isChecked ? accentColour : surfaceColour,
        );
      }
    }
  },
);

When("the user tabs to the theme group", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const themeRadios = groupOf(page, "theme").getByRole(RADIO_ROLE);
  for (let pressCount = 0; pressCount < MIN_TAB_PRESSES; pressCount += 1) {
    await page.keyboard.press(TAB_KEY);
    if (
      await themeRadios.evaluateAll((radios) =>
        radios.includes(document.activeElement as HTMLInputElement),
      )
    ) {
      return;
    }
  }
  throw new Error("the theme group never received the focus");
});

Then("the focused option shows a focus outline", async ({ locationsWorld }) => {
  const focusedLabel = locationsWorld.page.locator(
    "label:has(input:focus-visible)",
  );
  await expect(focusedLabel).toHaveCount(1);
  const outlineStyle = await focusedLabel.evaluate(
    (element) => getComputedStyle(element).outlineStyle,
  );
  expect(outlineStyle).not.toBe(NO_OUTLINE_STYLE);
});

Then(
  /^the caption and the options of the (theme|hour format|view) group share one row$/,
  async ({ locationsWorld }, kind: GroupKind) => {
    const group = groupOf(locationsWorld.page, kind);
    const captionBox = await group.locator(":scope > span").boundingBox();
    const trackBox = await group.locator(":scope > div").boundingBox();
    if (captionBox === null || trackBox === null) throw new Error("no box");
    expect(captionBox.y).toBeLessThan(trackBox.y + trackBox.height);
    expect(trackBox.y).toBeLessThan(captionBox.y + captionBox.height);
    expect(captionBox.x).toBeLessThan(trackBox.x);
  },
);

Then(
  "the theme group, the hour format group and the view group are at most {int} px high",
  async ({ locationsWorld }, maxHeight: number) => {
    for (const kind of Object.keys(GROUP_NAMES) as GroupKind[]) {
      const box = await groupOf(locationsWorld.page, kind).boundingBox();
      expect(box?.height ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(
        maxHeight,
      );
    }
  },
);

const notedBoxes = new WeakMap<Page, unknown[]>();
const readThemeOptionBoxes = async (page: Page) => {
  const boxes: unknown[] = [];
  for (const label of await labelsOf(groupOf(page, "theme")).all()) {
    boxes.push(await label.boundingBox());
  }
  return boxes;
};

Given(
  "the positions of the theme options are noted",
  async ({ locationsWorld }) => {
    notedBoxes.set(
      locationsWorld.page,
      await readThemeOptionBoxes(locationsWorld.page),
    );
  },
);

Then(
  "the theme options keep their position and size",
  async ({ locationsWorld }) => {
    expect(await readThemeOptionBoxes(locationsWorld.page)).toEqual(
      notedBoxes.get(locationsWorld.page),
    );
  },
);
