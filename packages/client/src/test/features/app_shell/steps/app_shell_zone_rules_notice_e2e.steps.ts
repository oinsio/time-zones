import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { publishNewerRelease } from "../../zone_rules_updates/steps/zoneRulesPublishedFiles";
import { test } from "./app_shell_smoke_e2e.fixtures";

const { Given, When, Then } = createBdd(test);

const TAB_KEY = "Tab";
const ENTER_KEY = "Enter";
const ESCAPE_KEY = "Escape";
const MAX_TAB_STOPS = 80;
const RELOAD_BUTTON_NAME = "Reload";
const DISMISS_BUTTON_NAME = "Dismiss";
const BUTTON_ROLE = "button";
const HEADING_ROLE = "heading";
const APP_TITLE = "Time Zones";
const PARENT_SELECTOR = "..";
const NOTICE_TIMEOUT_MS = 15_000;

const zoneRulesNotice = (
  page: import("@playwright/test").Page,
  release: string,
) => page.getByText(new RegExp(`Time zone rules ${release} are ready`));

let publishedRelease = "";

// Verifies FR4, FR7 of add-remote-zone-rules-updates: the site answers with a newer release.
Given("a newer zone rules release is published", async ({ smokeWorld }) => {
  publishedRelease = await publishNewerRelease(smokeWorld.page);
});

// Verifies FR7, UX1 of add-remote-zone-rules-updates.
Then(
  "the zone rules update notice names the published release",
  async ({ smokeWorld }) => {
    await expect(
      zoneRulesNotice(smokeWorld.page, publishedRelease),
    ).toBeVisible({
      timeout: NOTICE_TIMEOUT_MS,
    });
  },
);

// Verifies FR7, UX1, NFR-A1 of add-remote-zone-rules-updates: Tab reaches Reload, then Dismiss.
Then(
  "the keyboard reaches Reload and the dismiss control of the zone rules update notice",
  async ({ smokeWorld }) => {
    const { page } = smokeWorld;
    await expect(zoneRulesNotice(page, publishedRelease)).toBeVisible({
      timeout: NOTICE_TIMEOUT_MS,
    });
    const reloadButton = page.getByRole(BUTTON_ROLE, {
      name: RELOAD_BUTTON_NAME,
    });
    for (let tabStop = 0; tabStop < MAX_TAB_STOPS; tabStop += 1) {
      if (
        await reloadButton.evaluate(
          (button) => button === document.activeElement,
        )
      )
        break;
      await page.keyboard.press(TAB_KEY);
    }
    await expect(reloadButton).toBeFocused();
    await page.keyboard.press(TAB_KEY);
    await expect(
      zoneRulesNotice(page, publishedRelease)
        .locator(PARENT_SELECTOR)
        .getByRole(BUTTON_ROLE, { name: DISMISS_BUTTON_NAME }),
    ).toBeFocused();
  },
);

// Verifies UX1 of add-remote-zone-rules-updates: the notice does not push the heading out of view.
Then("the page heading stays in the viewport", async ({ smokeWorld }) => {
  await expect(
    smokeWorld.page.getByRole(HEADING_ROLE, { name: APP_TITLE }),
  ).toBeInViewport();
});

// Verifies FR7, NFR-A1 of add-remote-zone-rules-updates: Enter on the dismiss control.
Then(
  "Enter on the dismiss control hides the zone rules update notice",
  async ({ smokeWorld }) => {
    const { page } = smokeWorld;
    await page.keyboard.press(ENTER_KEY);
    await expect(zoneRulesNotice(page, publishedRelease)).toBeHidden();
  },
);

// Verifies FR7, NFR-A1 of add-remote-zone-rules-updates: Esc dismisses.
When(
  "the user dismisses the zone rules update notice with Escape",
  async ({ smokeWorld }) => {
    const { page } = smokeWorld;
    await expect(zoneRulesNotice(page, publishedRelease)).toBeVisible({
      timeout: NOTICE_TIMEOUT_MS,
    });
    await page.keyboard.press(ESCAPE_KEY);
  },
);

Then("the zone rules update notice is hidden", async ({ smokeWorld }) => {
  await expect(zoneRulesNotice(smokeWorld.page, publishedRelease)).toBeHidden();
});
