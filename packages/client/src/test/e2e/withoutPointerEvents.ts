import type { Page } from "@playwright/test";

const SUPPRESSED_POINTER_EVENTS = [
  "pointerdown",
  "pointermove",
  "pointerup",
  "pointercancel",
];
const IGNORE_TOUCH_ACTION_STYLE = "* { touch-action: auto !important; }";

/**
 * Makes Chromium behave like iOS Safari 12 for input: no `PointerEvent`, no
 * pointer events reaching the page and no `touch-action`, so React and dnd-kit
 * see only touch, mouse and click events. Call it before the page loads.
 * Implements FR8, FR9 of support-legacy-ios-12-safari (D11).
 */
export const emulateEngineWithoutPointerEvents = (page: Page) =>
  page.addInitScript(
    ({ eventNames, styleText }) => {
      Reflect.deleteProperty(window, "PointerEvent");
      for (const eventName of eventNames) {
        window.addEventListener(
          eventName,
          (event) => event.stopImmediatePropagation(),
          true,
        );
      }
      document.addEventListener("DOMContentLoaded", () => {
        const style = document.createElement("style");
        style.textContent = styleText;
        document.head.append(style);
      });
    },
    {
      eventNames: SUPPRESSED_POINTER_EVENTS,
      styleText: IGNORE_TOUCH_ACTION_STYLE,
    },
  );
