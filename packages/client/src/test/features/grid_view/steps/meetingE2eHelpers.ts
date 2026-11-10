// Implements FR5-FR13, NFR-A2 of add-grid-meeting-range-and-share: locators and gestures of the meeting state in a real browser.
import { expect, type Locator, type Page } from "@playwright/test";
import { englishLocale } from "../../main_page/steps/englishTexts";
import { cellOf, centreOf, panelOf, requireBox } from "./hourGridE2eHelpers";

export const MEETING_FRAME_SELECTOR = "[data-meeting-frame-columns]";
export const HOUR_STRIP_SELECTOR = "[data-hour-strip]";
const DRAG_STEP_COUNT = 8;
const SAMPLE_CITY = "Almaty";
const SAMPLE_START_COLUMN = 9;

export const meetingFrameOf = (page: Page) =>
  page.locator(MEETING_FRAME_SELECTOR);
export const startHandleOf = (page: Page) =>
  page.getByRole("slider", { name: englishLocale.meeting.startHandle });
export const endHandleOf = (page: Page) =>
  page.getByRole("slider", { name: englishLocale.meeting.endHandle });
export const shareButtonOf = (page: Page) =>
  page.getByRole("button", { name: englishLocale.meeting.share });
export const clearButtonOf = (page: Page) =>
  page.getByRole("button", { name: englishLocale.meeting.clear });
export const meetingTitleOf = (page: Page) =>
  page.getByRole("heading", { level: 1 });

/** The hour strip of the n-th row, counted from 0. */
export const stripOfRow = (page: Page, rowIndex: number) =>
  panelOf(page).locator(HOUR_STRIP_SELECTOR).nth(rowIndex);

/** The meeting range as the value texts of the two handles. */
export async function readMeetingTimes(page: Page) {
  return {
    start: await startHandleOf(page).getAttribute("aria-valuetext"),
    end: await endHandleOf(page).getAttribute("aria-valuetext"),
  };
}

export async function expectMeetingTimes(
  page: Page,
  start: string,
  end: string,
) {
  await expect(startHandleOf(page)).toHaveAttribute("aria-valuetext", start);
  await expect(endHandleOf(page)).toHaveAttribute("aria-valuetext", end);
}

/** A meeting 09:00–10:00 in Almaty: a tap on column 9. */
export async function tapSampleHour(page: Page) {
  await cellOf(page, SAMPLE_CITY, SAMPLE_START_COLUMN).click();
}

/** The sample meeting 09:00–11:00: the sample hour, then Page Up on the end handle. */
export async function setSampleMeeting(page: Page) {
  await tapSampleHour(page);
  await endHandleOf(page).press("PageUp");
  await expectMeetingTimes(page, "09:00", "11:00");
}

/** A mouse drag over the cells of one row, from one column to another. */
export async function dragAcrossCells(
  page: Page,
  city: string,
  fromColumn: number,
  toColumn: number,
) {
  const from = await centreOf(await requireBox(cellOf(page, city, fromColumn)));
  const to = await centreOf(await requireBox(cellOf(page, city, toColumn)));
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: DRAG_STEP_COUNT });
  await page.mouse.up();
}

/** The left edge of a cell, where a handle snaps to the cell's start. */
export async function leftEdgeOfCell(page: Page, city: string, column: number) {
  return (await requireBox(cellOf(page, city, column))).x;
}

/** A mouse drag of a handle to an x position on its own row. */
export async function dragHandleWithMouse(
  page: Page,
  handle: Locator,
  targetX: number,
) {
  const from = await centreOf(await requireBox(handle));
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(targetX, from.y, { steps: DRAG_STEP_COUNT });
  await page.mouse.up();
}
