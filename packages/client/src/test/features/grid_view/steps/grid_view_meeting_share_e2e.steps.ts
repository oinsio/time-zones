import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";
import { englishLocale } from "../../main_page/steps/englishTexts";
import {
  clearButtonOf,
  endHandleOf,
  shareButtonOf,
  startHandleOf,
} from "./meetingE2eHelpers";

const { Given, When, Then } = createBdd(test);

const SHARED_TEXT_KEY = "sharedMeetingData";
const MAX_TAB_STOPS = 80;
const NOTICE_SELECTOR = "[role='status']";
const COLOR_CONTRAST_RULE = "color-contrast";
const DIMMED_CELL_SELECTOR = "[data-hour-cell].opacity-40";

/** Replaces `navigator.share` and `navigator.clipboard` before the app starts. */
const stubBrowser = (
  page: Page,
  behaviour: { share: "works" | "closed" | "missing"; hasClipboard: boolean },
) =>
  page.addInitScript(
    ({ stubbed, key }) => {
      const define = (name: string, value: unknown) =>
        Object.defineProperty(navigator, name, { value, configurable: true });
      if (stubbed.share === "missing") define("share", undefined);
      else {
        define("share", async (data: unknown) => {
          Reflect.set(window, key, data);
          if (stubbed.share === "closed") {
            throw new DOMException("closed", "AbortError");
          }
        });
      }
      if (!stubbed.hasClipboard) define("clipboard", undefined);
    },
    { stubbed: behaviour, key: SHARED_TEXT_KEY },
  );

const readShared = (page: Page) =>
  page.evaluate(
    (key) => Reflect.get(window, key) as Record<string, unknown> | undefined,
    SHARED_TEXT_KEY,
  );

// Verifies FR15 of add-grid-meeting-range-and-share: browser stubs of D10.
Given("a browser with a system share", async ({ locationsWorld }) => {
  await stubBrowser(locationsWorld.page, {
    share: "works",
    hasClipboard: true,
  });
});

Given(
  "a browser whose system share reports that the user closed the sheet",
  async ({ locationsWorld }) => {
    await stubBrowser(locationsWorld.page, {
      share: "closed",
      hasClipboard: true,
    });
  },
);

Given("a browser without a system share", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await stubBrowser(page, { share: "missing", hasClipboard: true });
});

Given(
  "a browser without a system share and without clipboard access",
  async ({ locationsWorld }) => {
    await stubBrowser(locationsWorld.page, {
      share: "missing",
      hasClipboard: false,
    });
  },
);

When("the user chooses Share meeting", async ({ locationsWorld }) => {
  await shareButtonOf(locationsWorld.page).click();
});

Then(
  "the system share received a text without a link, exactly these lines:",
  async ({ locationsWorld }, table) => {
    const expectedLines = (table.rows() as string[][]).map(([line]) => line);
    await expect
      .poll(async () =>
        Object.keys((await readShared(locationsWorld.page)) ?? {}),
      )
      .toEqual(["text"]);
    const shared = await readShared(locationsWorld.page);
    expect(String(shared?.text).split("\n")).toEqual(expectedLines);
    expect(String(shared?.text)).not.toMatch(/https?:/);
  },
);

Then("no share notice is shown", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await expect(shareButtonOf(page)).toBeVisible();
  for (const message of [
    englishLocale.meeting.copiedNotice,
    englishLocale.meeting.shareFailedNotice,
  ]) {
    await expect(page.getByText(message)).toHaveCount(0);
  }
});

Then(
  "the clipboard holds the meeting share text",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toMatch(/^Meeting on Sunday, March 8, 2026, 2 h\nAlmaty: 09:00–11:00\n/);
  },
);

Then(
  "the share notice {string} is shown",
  async ({ locationsWorld }, message: string) => {
    await expect(
      locationsWorld.page.locator(NOTICE_SELECTOR).filter({ hasText: message }),
    ).toBeVisible();
  },
);

Then("the focus stays on Share meeting", async ({ locationsWorld }) => {
  await expect(shareButtonOf(locationsWorld.page)).toBeFocused();
});

// Verifies NFR-A1 of add-grid-meeting-range-and-share: the Tab order of the meeting state.
Then(
  "tabbing from Share meeting visits Share meeting, Clear meeting, the rows' controls, Meeting start and Meeting end in this order",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    await shareButtonOf(page).focus();
    const names: string[] = [];
    for (let stop = 0; stop < MAX_TAB_STOPS; stop += 1) {
      names.push(
        await page.evaluate(
          () =>
            document.activeElement?.getAttribute("aria-label") ??
            document.activeElement?.textContent ??
            "",
        ),
      );
      if (
        await endHandleOf(page).evaluate((el) => el === document.activeElement)
      )
        break;
      await page.keyboard.press("Tab");
    }
    const labelOf = async (locator: ReturnType<typeof shareButtonOf>) =>
      (await locator.getAttribute("aria-label")) ?? "";
    expect(names[0]).toBe(await labelOf(shareButtonOf(page)));
    expect(names[1]).toBe(await labelOf(clearButtonOf(page)));
    expect(names.slice(-2)).toEqual([
      await labelOf(startHandleOf(page)),
      await labelOf(endHandleOf(page)),
    ]);
    expect(names.length).toBeGreaterThan(4);
  },
);

// Verifies NFR-A1 of add-grid-meeting-range-and-share: a short report of the violations, not their whole nodes.
// Dimmed cells have a recorded colour-contrast exception: the spec fixes their opacity at 0.4 (FR7, UX1), which no digit colour can lift to 4.5:1.
// Only that one rule is off for them; every other rule runs on them, and every rule runs on the rest of the page.
Then(
  "the meeting state has no accessibility violations",
  async ({ locationsWorld }) => {
    const summarize = (scan: Awaited<ReturnType<AxeBuilder["analyze"]>>) =>
      scan.violations.map((violation) => ({
        id: violation.id,
        targets: violation.nodes.slice(0, 3).map((node) => node.target),
      }));
    const pageScan = await new AxeBuilder({ page: locationsWorld.page })
      .exclude(DIMMED_CELL_SELECTOR)
      .analyze();
    const dimmedCellScan = await new AxeBuilder({ page: locationsWorld.page })
      .include(DIMMED_CELL_SELECTOR)
      .disableRules(COLOR_CONTRAST_RULE)
      .analyze();
    expect([...summarize(pageScan), ...summarize(dimmedCellScan)]).toEqual([]);
  },
);
