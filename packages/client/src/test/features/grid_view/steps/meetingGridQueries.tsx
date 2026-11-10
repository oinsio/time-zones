// Implements FR5, FR7, FR8, FR13 of add-grid-meeting-range-and-share: queries and gestures on the rendered Grid view.
import {
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react/pure";
import i18n from "i18next";
import { expect } from "vitest";
import { TRACK_STEP_MINUTES } from "@/constants";
import { getCardOf } from "../../locations/steps/deviceTimeQueries";

const DIMMED_CLASS = "opacity-40";
const FRAME_SELECTOR = "[data-meeting-frame-columns]";
const HOUR_FRAME_SELECTOR = "[data-hour-frame-index]";
const SPAN_SEPARATOR = "–";
const FIRST_COLUMN = 9;

export const stripOf = (city: string) =>
  screen.getByRole("slider", {
    name: i18n.t("locations.timeSliderLabel", { city }),
  });

const cellBoxesOf = (city: string) =>
  Array.from(stripOf(city).querySelectorAll<HTMLElement>("[data-hour-cell]"));

export const tapColumn = (city: string, column: number) =>
  fireEvent.click(cellBoxesOf(city)[column]);

/** A tap on the first row, whatever language its city is written in. */
const tapColumnOfFirstRow = (column: number) =>
  fireEvent.click(
    document
      .querySelectorAll<HTMLElement>("[data-hour-strip]")[0]
      .querySelectorAll<HTMLElement>("[data-hour-cell]")[column],
  );

export const handleOf = (handleKey: "startHandle" | "endHandle") =>
  screen.getByRole("slider", { name: i18n.t(`meeting.${handleKey}`) });

export const pressOnHandle = (
  handleKey: "startHandle" | "endHandle",
  key: string,
  times = 1,
) => {
  for (let press = 0; press < times; press += 1) {
    fireEvent.keyDown(handleOf(handleKey), { key });
  }
};

/** The sample meeting 09:00–11:00 in Almaty: tap column 9, end handle one hour on. */
export const setSampleMeeting = () => {
  tapColumnOfFirstRow(FIRST_COLUMN);
  pressOnHandle("endHandle", "PageUp");
};

/** A meeting of `minutes` from 09:00: the hour of column 9 cut to a quarter hour, then widened. */
export const setMeetingOfMinutes = (minutes: number) => {
  tapColumnOfFirstRow(FIRST_COLUMN);
  pressOnHandle("endHandle", "Home");
  pressOnHandle("endHandle", "ArrowRight", minutes / TRACK_STEP_MINUTES - 1);
};

export const spanOf = (city: string) => {
  const text = within(getCardOf(city)).getByRole("button", {
    name: /^Enter meeting time|^Ввести время встречи/,
  }).textContent;
  expect(text).toContain(SPAN_SEPARATOR);
  return text;
};

export const hasDayShiftMark = (city: string) =>
  [i18n.t("locations.dayShiftEarlier"), i18n.t("locations.dayShiftLater")].some(
    (mark) => within(getCardOf(city)).queryByText(mark) !== null,
  );

export const frameColumns = () =>
  document
    .querySelector(FRAME_SELECTOR)
    ?.getAttribute("data-meeting-frame-columns") ?? null;

export const hourFrameColumn = () => {
  const frame = document.querySelector(HOUR_FRAME_SELECTOR);
  return frame === null
    ? null
    : Number(frame.getAttribute("data-hour-frame-index"));
};

export const isColumnDimmed = (city: string, column: number) =>
  cellBoxesOf(city)[column].classList.contains(DIMMED_CLASS);

export const dimmedColumnsOf = (city: string) =>
  cellBoxesOf(city).flatMap((cell, column) =>
    cell.classList.contains(DIMMED_CLASS) ? [column] : [],
  );

export const meetingTitle = () => screen.getByRole("heading", { level: 1 });

export const clickButton = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }));

export const waitForMeetingBarToGo = () =>
  waitFor(() => expect(frameColumns()).toBeNull());
