import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { TOLERANCE_PX } from "../../time_selection/steps/cardLayoutE2eHelpers";
import { requireBox } from "../../time_selection/steps/timeSelectionE2eHelpers";
import { test } from "./locations_ui_e2e.fixtures";
import { listRow } from "./locationsE2eHelpers";

const { Then } = createBdd(test);

/** The bottom line of a card that is not a status message: its last child paragraph. */
const clockChangeNoteOf = (page: Parameters<typeof listRow>[0], city: string) =>
  listRow(page, city).locator(":scope > p:last-child:not([role])");

const wallTimeHintOfCard = (
  page: Parameters<typeof listRow>[0],
  city: string,
) => listRow(page, city).locator(':scope > p:last-child[role="status"]');

const expectBottomLine = async (
  page: Parameters<typeof listRow>[0],
  city: string,
) => {
  const card = await requireBox(listRow(page, city));
  const note = await requireBox(clockChangeNoteOf(page, city));
  const otherBottoms = await listRow(page, city).evaluate((cardElement) =>
    [...cardElement.children]
      .filter((child) => child !== cardElement.lastElementChild)
      .map((child) => child.getBoundingClientRect().bottom),
  );
  const { y: cardTop } = card;
  expect(otherBottoms.length).toBeGreaterThan(0);
  for (const bottom of otherBottoms) {
    expect(note.y).toBeGreaterThanOrEqual(bottom - TOLERANCE_PX);
  }
  expect(note.y).toBeGreaterThan(cardTop);
  expect(note.y + note.height).toBeLessThanOrEqual(
    card.y + card.height + TOLERANCE_PX,
  );
  expect(note.x).toBeGreaterThanOrEqual(card.x - TOLERANCE_PX);
  expect(note.x + note.width).toBeLessThanOrEqual(
    card.x + card.width + TOLERANCE_PX,
  );
};

// Verifies FR2, NFR-A1, UX1 of show-clock-change-note-on-location-cards.
Then(
  "the {string} card shows {string} as its bottom line",
  async ({ locationsWorld }, city: string, text: string) => {
    const { page } = locationsWorld;
    await expect(clockChangeNoteOf(page, city)).toHaveText(text);
    await expectBottomLine(page, city);
  },
);

// Verifies NFR-A1 of show-clock-change-note-on-location-cards.
Then(
  "the note of {string} is not inside a live region and has no status role",
  async ({ locationsWorld }, city: string) => {
    const note = clockChangeNoteOf(locationsWorld.page, city);
    await expect(note).not.toHaveAttribute("role", /.+/);
    const liveAncestors = await note.evaluate((element) =>
      element.closest("[aria-live], [role='status'], [role='alert']"),
    );
    expect(liveAncestors).toBeNull();
  },
);

// Verifies NFR-A1 of show-clock-change-note-on-location-cards.
Then(
  "the accessible name of the {string} row does not contain its note",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    const noteText = (await clockChangeNoteOf(page, city).textContent()) ?? "";
    expect(noteText).not.toBe("");
    const accessibleName = await listRow(page, city).evaluate(
      (element) =>
        element.getAttribute("aria-label") ??
        (element.getAttribute("aria-labelledby") ?? "")
          .split(" ")
          .map((id) => document.getElementById(id)?.textContent ?? "")
          .join(" "),
    );
    expect(accessibleName).not.toBe("");
    expect(accessibleName).not.toContain(noteText);
  },
);

// Verifies FR2, FR5 of show-clock-change-note-on-location-cards.
Then(
  "the {string} card shows no clock change note",
  async ({ locationsWorld }, city: string) => {
    await expect(clockChangeNoteOf(locationsWorld.page, city)).toHaveCount(0);
  },
);

// Verifies FR2, UX1 of show-clock-change-note-on-location-cards.
Then(
  "the {string} card shows a clock change note",
  async ({ locationsWorld }, city: string) => {
    await expect(clockChangeNoteOf(locationsWorld.page, city)).toBeVisible();
  },
);

// Verifies FR6 of show-clock-change-note-on-location-cards.
Then(
  "the {string} card shows the wall-time hint and no clock change note",
  async ({ locationsWorld }, city: string) => {
    const { page } = locationsWorld;
    await expect(wallTimeHintOfCard(page, city)).toBeVisible();
    await expect(clockChangeNoteOf(page, city)).toHaveCount(0);
  },
);

// Verifies NFR-R1, UX1 of show-clock-change-note-on-location-cards.
Then(
  "the clock change note of {string} is the bottom line of its card",
  async ({ locationsWorld }, city: string) => {
    await expect(clockChangeNoteOf(locationsWorld.page, city)).toBeVisible();
    await expectBottomLine(locationsWorld.page, city);
  },
);
