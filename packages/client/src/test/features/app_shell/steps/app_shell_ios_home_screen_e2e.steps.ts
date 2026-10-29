import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "./app_shell_smoke_e2e.fixtures";

const { Then } = createBdd(test);

const IOS_HOME_SCREEN_META_SELECTOR =
  'meta[name="apple-mobile-web-app-capable"]';
const CONTENT_ATTRIBUTE = "content";
const CAPABLE_CONTENT = "yes";

// Verifies FR11 of support-legacy-ios-12-safari: the iOS home-screen meta tag.
Then("the page declares an iOS home-screen web app", async ({ smokeWorld }) => {
  await expect(
    smokeWorld.page.locator(IOS_HOME_SCREEN_META_SELECTOR),
  ).toHaveAttribute(CONTENT_ATTRIBUTE, CAPABLE_CONTENT);
});
