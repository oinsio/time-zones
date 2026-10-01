import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "./locations_ui_e2e.fixtures";

import { listRow } from "./locationsE2eHelpers";
import {
  DROP_SETTLE_MS,
  handleNameOf,
  MS_PER_SECOND,
  measurementsByPage,
  readTransitionRuns,
  recordTransitionRuns,
} from "./locationsReorderE2eHelpers";

const { Given, Then } = createBdd(test);

const NO_TRANSITION_DURATION = "0s";
const NO_SHADOW = "none";

// Verifies NFR-A4 of reorder-locations-by-drag-and-drop.
Given("the system asks to reduce motion", async ({ locationsWorld }) => {
  await locationsWorld.page.emulateMedia({ reducedMotion: "reduce" });
});

Given("transition runs are recorded", async ({ locationsWorld }) => {
  await recordTransitionRuns(locationsWorld.page);
});

// Verifies UX1 of reorder-locations-by-drag-and-drop: the picked-up card still held.
Then(
  "the {string} card has a {int} ms transform transition",
  async ({ locationsWorld }, cityName: string, durationMs: number) => {
    const card = listRow(locationsWorld.page, cityName);
    await expect(card).toHaveCSS("transition-property", /transform/);
    await expect(card).toHaveCSS(
      "transition-duration",
      `${durationMs / MS_PER_SECOND}s`,
    );
  },
);

// Verifies NFR-A4 of reorder-locations-by-drag-and-drop.
Then(
  "the {string} card has no transition",
  async ({ locationsWorld }, cityName: string) => {
    const card = listRow(locationsWorld.page, cityName);
    await expect(card).toHaveCSS("transition-duration", NO_TRANSITION_DURATION);
    expect(
      await card.evaluate((element) => element.getAnimations().length),
    ).toBe(0);
  },
);

// Verifies UX1 of reorder-locations-by-drag-and-drop: the drop animation.
Then(
  "the {string} card settles into its slot with a {int} ms transform transition",
  async ({ locationsWorld }, cityName: string, durationMs: number) => {
    const expectedRun = {
      handleName: handleNameOf(cityName),
      propertyName: "transform",
      duration: `${durationMs / MS_PER_SECOND}s`,
    };
    await expect
      .poll(
        async () =>
          (await readTransitionRuns(locationsWorld.page)).filter(
            (run) =>
              run.handleName === expectedRun.handleName &&
              run.propertyName === expectedRun.propertyName &&
              run.duration === expectedRun.duration,
          ).length,
      )
      .toBeGreaterThan(0);
  },
);

// Verifies NFR-A4 of reorder-locations-by-drag-and-drop: no drop animation.
Then(
  "the {string} card ran no transition after the drop",
  async ({ locationsWorld }, cityName: string) => {
    await locationsWorld.page.waitForTimeout(DROP_SETTLE_MS);
    const runs = await readTransitionRuns(locationsWorld.page);
    expect(
      runs.filter((run) => run.handleName === handleNameOf(cityName)),
    ).toEqual([]);
  },
);

// Verifies UX2 of reorder-locations-by-drag-and-drop.
Then(
  "the dragged {string} card stays in its column, keeps its width and is raised",
  async ({ locationsWorld }, cityName: string) => {
    const { page } = locationsWorld;
    const before = measurementsByPage.get(page);
    const dragged = await listRow(page, cityName).boundingBox();
    expect(dragged?.x).toBe(before?.card.x);
    expect(dragged?.width).toBe(before?.card.width);
    const boxShadow = await listRow(page, cityName).evaluate(
      (element) => getComputedStyle(element).boxShadow,
    );
    expect(boxShadow).not.toBe(NO_SHADOW);
  },
);

Then(
  "the list keeps its height and the {string} card stays where it was",
  async ({ locationsWorld }, cityName: string) => {
    const { page } = locationsWorld;
    const before = measurementsByPage.get(page);
    const list = await page.getByRole("list").boundingBox();
    const neighbour = await listRow(page, cityName).boundingBox();
    expect(list?.height).toBe(before?.listHeight);
    expect(neighbour?.y).toBe(before?.neighbourTop);
  },
);
