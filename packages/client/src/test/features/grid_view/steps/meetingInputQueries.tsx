// Implements FR1-FR4 of fix-grid-meeting-range-lock-and-layering: queries and gestures of the locked controls and the meeting range input.
import { screen, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import { expect } from "vitest";
import { getCardOf } from "../../locations/steps/deviceTimeQueries";

const SPAN_BUTTON_NAME = /^Enter meeting time|^Ввести время встречи/;
const TIME_BUTTON_NAME = /^Enter time|^Ввести время —/;
const START_FIELD_NAME = /^Start time|^Время начала/;
const END_FIELD_NAME = /^End time|^Время окончания/;
const DISABLED_OPACITY_CLASS = "disabled:opacity-40";

export const spanButtonOf = (city: string) =>
  within(getCardOf(city)).getByRole("button", { name: SPAN_BUTTON_NAME });

export const timeButtonOf = (city: string) =>
  within(getCardOf(city)).getByRole("button", { name: TIME_BUTTON_NAME });

export const startFieldOf = (city: string) =>
  within(getCardOf(city)).getByRole("textbox", { name: START_FIELD_NAME });

export const endFieldOf = (city: string) =>
  within(getCardOf(city)).getByRole("textbox", { name: END_FIELD_NAME });

/** Every drag handle and location menu button of the page. */
const lockableButtons = () =>
  screen
    .getAllByRole("button")
    .filter(
      (button) =>
        button.hasAttribute("aria-roledescription") ||
        button.getAttribute("aria-haspopup") === "menu",
    );

export const expectRowControlsLocked = () => {
  const buttons = lockableButtons();
  expect(buttons.length).toBeGreaterThan(0);
  for (const button of buttons) {
    expect(button).toBeDisabled();
    expect(button).toHaveClass(DISABLED_OPACITY_CLASS);
  }
};

export const expectRowControlsFree = () => {
  const buttons = lockableButtons();
  expect(buttons.length).toBeGreaterThan(0);
  for (const button of buttons) expect(button).toBeEnabled();
};

export const hasWallTimeInput = (city: string) =>
  within(getCardOf(city)).queryByRole("textbox", { name: TIME_BUTTON_NAME }) !==
  null;

export const openMeetingRangeInput = (city: string) =>
  userEvent.click(spanButtonOf(city));

export const typeInField = async (field: HTMLElement, text: string) => {
  await userEvent.clear(field);
  await userEvent.type(field, text);
};

export const enterMeetingRange = async (
  city: string,
  startText: string,
  endText: string,
) => {
  await openMeetingRangeInput(city);
  await typeInField(startFieldOf(city), startText);
  await typeInField(endFieldOf(city), `${endText}{Enter}`);
};
