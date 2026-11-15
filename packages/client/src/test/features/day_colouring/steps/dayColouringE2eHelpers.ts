// Implements FR12 of add-day-colouring-setting: reading the day colours a view draws, in a real browser.
import type { Locator, Page } from "@playwright/test";
import { sliderOf } from "../../time_selection/steps/timeSelectionE2eHelpers";

const DAY_TRACK_BAR_SELECTOR = "[data-day-track-bar]";

/** The track bar of a city: the Cards day track, or the hour strip slider's own bar when it has one. */
export const dayTrackBarOf = (page: Page, city: string): Locator =>
  sliderOf(page, city).locator(DAY_TRACK_BAR_SELECTOR);
