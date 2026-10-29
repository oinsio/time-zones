// Verifies NFR-A2 of set-home-location-and-show-differences (D7): WAI-ARIA menu button keys.
import { describe, expect, it } from "vitest";
import { getMenuKeyAction, MenuKeyAction } from "./locationMenuKeys";

describe("getMenuKeyAction", () => {
  it.each([
    ["Enter", MenuKeyAction.ACTIVATE],
    [" ", MenuKeyAction.ACTIVATE],
    ["ArrowDown", MenuKeyAction.NEXT],
    ["ArrowUp", MenuKeyAction.PREVIOUS],
    ["Home", MenuKeyAction.FIRST],
    ["End", MenuKeyAction.LAST],
    ["Escape", MenuKeyAction.CLOSE],
    ["Tab", MenuKeyAction.LEAVE],
    ["a", undefined],
    ["ArrowLeft", undefined],
    ["PageDown", undefined],
  ])("should map %j to %s", (key, expected) => {
    expect(getMenuKeyAction(key)).toBe(expected);
  });
});
