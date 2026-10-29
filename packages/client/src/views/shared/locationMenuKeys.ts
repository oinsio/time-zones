import { KeyboardKey } from "@/constants";

/** What a key does in the location menu button pattern (WAI-ARIA). */
export enum MenuKeyAction {
  /** Enter and Space: the browser's own button activation, left to it. */
  ACTIVATE = "ACTIVATE",
  NEXT = "NEXT",
  PREVIOUS = "PREVIOUS",
  FIRST = "FIRST",
  LAST = "LAST",
  /** Closes the menu and returns focus to the button. */
  CLOSE = "CLOSE",
  /** Closes the menu and lets focus move on. */
  LEAVE = "LEAVE",
}

const ACTION_BY_KEY: ReadonlyMap<string, MenuKeyAction> = new Map([
  [KeyboardKey.ENTER, MenuKeyAction.ACTIVATE],
  [KeyboardKey.SPACE, MenuKeyAction.ACTIVATE],
  [KeyboardKey.ARROW_DOWN, MenuKeyAction.NEXT],
  [KeyboardKey.ARROW_UP, MenuKeyAction.PREVIOUS],
  [KeyboardKey.HOME, MenuKeyAction.FIRST],
  [KeyboardKey.END, MenuKeyAction.LAST],
  [KeyboardKey.ESCAPE, MenuKeyAction.CLOSE],
  [KeyboardKey.TAB, MenuKeyAction.LEAVE],
]);

/**
 * The menu action a key asks for; `undefined` for other keys.
 * Implements NFR-A2 of set-home-location-and-show-differences (D7).
 */
export function getMenuKeyAction(key: string): MenuKeyAction | undefined {
  return ACTION_BY_KEY.get(key);
}
