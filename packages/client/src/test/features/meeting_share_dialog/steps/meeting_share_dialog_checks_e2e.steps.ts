// Verifies FR1, FR2, FR4, FR9, UX1, UX3, NFR-A1, NFR-A2, NFR-A3, NFR-R1, NFR-R2 of add-meeting-share-dialog.
import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  checkboxesOf,
  dialogShareButtonOf,
  languageButtonOf,
  MIN_TOUCH_TARGET_PX,
  pinOf,
  pointerTargetsOf,
  readShared,
  shareDialogOf,
  shareMeetingButtonOf,
} from "../../grid_view/steps/meetingShareE2eHelpers";
import { test } from "../../locations/steps/locations_ui_e2e.fixtures";

const { Then } = createBdd(test);

const DIALOG_SELECTOR = "[role='dialog']";
const WIDE_DIALOG_WIDTH_PX = 512;
const POSITION_TOLERANCE_PX = 2;
const PREVIEW_NAME = /^(Текст приглашения|Text of the invitation)$/;

Then("nothing was shared or copied", async ({ locationsWorld }) => {
  expect(await readShared(locationsWorld.page)).toBeUndefined();
});

Then(
  "the share dialog shows the hint {string}",
  async ({ locationsWorld }, hint: string) => {
    await expect(
      shareDialogOf(locationsWorld.page).getByText(hint),
    ).toBeVisible();
  },
);

Then("Share is inactive in the share dialog", async ({ locationsWorld }) => {
  await expect(dialogShareButtonOf(locationsWorld.page)).toBeDisabled();
});

Then(
  "Share cannot be activated by pointer or keyboard",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const share = dialogShareButtonOf(page);
    await share.click({ force: true });
    await share.focus();
    await page.keyboard.press("Enter");
    expect(await readShared(page)).toBeUndefined();
    await expect(shareDialogOf(page)).toBeVisible();
  },
);

Then("the focus is inside the share dialog", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await expect
    .poll(() =>
      shareDialogOf(page).evaluate((dialog) =>
        dialog.contains(document.activeElement),
      ),
    )
    .toBe(true);
});

Then("the focus is on Share meeting", async ({ locationsWorld }) => {
  await expect(shareMeetingButtonOf(locationsWorld.page)).toBeFocused();
});

Then(
  "the dialog is a modal dialog named {string}",
  async ({ locationsWorld }, name: string) => {
    const dialog = shareDialogOf(locationsWorld.page);
    await expect(dialog).toHaveAccessibleName(name);
    // Modal: the page behind the dialog is hidden from assistive technology.
    await expect(shareMeetingButtonOf(locationsWorld.page)).toHaveCount(0);
  },
);

Then(
  "each checkbox is named by its city label and is checked",
  async ({ locationsWorld }) => {
    const boxes = checkboxesOf(locationsWorld.page);
    expect(await boxes.count()).toBeGreaterThan(0);
    for (const city of ["Алматы", "Москва", "Калькутта", "Нью-Йорк"]) {
      await expect(
        shareDialogOf(locationsWorld.page).getByRole("checkbox", {
          name: city,
          checked: true,
        }),
      ).toBeVisible();
    }
  },
);

Then(
  "the pin is a toggle button named {string} that is not pressed",
  async ({ locationsWorld }, name: string) => {
    const pin = pinOf(locationsWorld.page);
    await expect(pin).toHaveAccessibleName(name);
    await expect(pin).toHaveAttribute("aria-pressed", "false");
  },
);

Then(
  "{string} and {string} are in a group named {string}",
  async (
    { locationsWorld },
    first: string,
    second: string,
    caption: string,
  ) => {
    const group = shareDialogOf(locationsWorld.page).getByRole("group", {
      name: caption,
    });
    await expect(group.getByRole("button", { name: first })).toBeVisible();
    await expect(group.getByRole("button", { name: second })).toBeVisible();
  },
);

Then(
  "the preview is a region named {string} that is not a live region",
  async ({ locationsWorld }, name: string) => {
    const region = shareDialogOf(locationsWorld.page).getByRole("region", {
      name: PREVIEW_NAME,
    });
    await expect(region).toHaveAccessibleName(name);
    await expect(region).not.toHaveAttribute("aria-live", /.+/);
  },
);

Then("the list of share languages is closed", async ({ locationsWorld }) => {
  await expect(languageButtonOf(locationsWorld.page)).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

Then("the share dialog is still open", async ({ locationsWorld }) => {
  await expect(shareDialogOf(locationsWorld.page)).toBeVisible();
});

Then(
  "the focus is on the share language button",
  async ({ locationsWorld }) => {
    await expect(languageButtonOf(locationsWorld.page)).toBeFocused();
  },
);

Then("the shared text has no Moscow line", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  await expect.poll(() => readShared(page)).toBeDefined();
  const text = String((await readShared(page))?.text);
  expect(text).toContain("Алматы");
  expect(text).not.toContain("Москва");
});

Then(
  "the share dialog has no accessibility violations",
  async ({ locationsWorld }) => {
    const scan = await new AxeBuilder({ page: locationsWorld.page })
      .include(DIALOG_SELECTOR)
      .analyze();
    expect(
      scan.violations.map((violation) => ({
        id: violation.id,
        targets: violation.nodes.slice(0, 3).map((node) => node.target),
      })),
    ).toEqual([]);
  },
);

Then(
  "the share dialog fills the screen and nothing scrolls horizontally",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const viewport = page.viewportSize();
    const box = await shareDialogOf(page).boundingBox();
    expect(box?.width).toBeCloseTo(viewport?.width ?? 0, 0);
    expect(box?.height).toBeCloseTo(viewport?.height ?? 0, 0);
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalScroll).toBe(false);
    const dialogOverflows = await shareDialogOf(page).evaluate(
      (dialog) => dialog.scrollWidth > dialog.clientWidth,
    );
    expect(dialogOverflows).toBe(false);
  },
);

Then(
  "every pointer target of the share dialog is at least 44 px wide and 44 px high",
  async ({ locationsWorld }) => {
    for (const target of pointerTargetsOf(locationsWorld.page)) {
      const box = await target.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
      expect(box?.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
    }
  },
);

Then(
  "the share dialog is centred and 512 px wide",
  async ({ locationsWorld }) => {
    const { page } = locationsWorld;
    const viewport = page.viewportSize();
    const box = await shareDialogOf(page).boundingBox();
    expect(box?.width).toBeCloseTo(WIDE_DIALOG_WIDTH_PX, 0);
    const centre = (box?.x ?? 0) + (box?.width ?? 0) / 2;
    expect(Math.abs(centre - (viewport?.width ?? 0) / 2)).toBeLessThanOrEqual(
      POSITION_TOLERANCE_PX,
    );
  },
);

Then("Share is fully visible", async ({ locationsWorld }) => {
  const { page } = locationsWorld;
  const box = await dialogShareButtonOf(page).boundingBox();
  const viewport = page.viewportSize();
  expect(box?.y).toBeGreaterThanOrEqual(0);
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(
    viewport?.height ?? 0,
  );
});
