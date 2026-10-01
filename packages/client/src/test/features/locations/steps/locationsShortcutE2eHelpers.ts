import type { Page } from "@playwright/test";

export const SHORTCUT_KEY = "/";
export const SHIFT_MODIFIER_BITMASK = 8;
export const SLASH_KEY_CODE = "Digit7";
const RECORDER_KEY = "slashKeyDefaultPrevented";
const FIELD_TEST_ID = "outside-field";

export enum OutsideField {
  TEXT_INPUT = "text input",
  TEXTAREA = "textarea",
  CONTENT_EDITABLE = "contenteditable element",
}

/** Removes focus from whatever holds it, so the key lands on the page. */
export const blurActiveElement = (page: Page) =>
  page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

/** Records whether a bubbling "/" keydown reached `window` already prevented. */
export const installDefaultPreventedRecorder = (page: Page) =>
  page.evaluate(
    ({ recorderKey, key }) => {
      window.addEventListener("keydown", (event) => {
        if (event.key === key) {
          Reflect.set(window, recorderKey, event.defaultPrevented);
        }
      });
    },
    { recorderKey: RECORDER_KEY, key: SHORTCUT_KEY },
  );

export const readDefaultPrevented = (page: Page) =>
  page.evaluate(
    (recorderKey) => Reflect.get(window, recorderKey),
    RECORDER_KEY,
  );

/** Appends a focused text-entry element outside the search. */
export const appendFocusedField = (page: Page, field: OutsideField) =>
  page.evaluate(
    ({ kind, testId, fields }) => {
      const element =
        kind === fields.TEXTAREA
          ? document.createElement("textarea")
          : document.createElement(
              kind === fields.TEXT_INPUT ? "input" : "div",
            );
      if (kind === fields.TEXT_INPUT) element.setAttribute("type", "text");
      if (kind === fields.CONTENT_EDITABLE) {
        element.setAttribute("contenteditable", "true");
        element.setAttribute("tabindex", "0");
      }
      element.setAttribute("data-testid", testId);
      document.body.appendChild(element);
      element.focus();
    },
    { kind: field, testId: FIELD_TEST_ID, fields: OutsideField },
  );

export const outsideField = (page: Page) => page.getByTestId(FIELD_TEST_ID);

/** Two animation frames, so a render caused by the key has happened. */
export const waitForTwoAnimationFrames = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
