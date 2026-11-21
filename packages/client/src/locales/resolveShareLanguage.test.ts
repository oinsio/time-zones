// Verifies FR5 of add-meeting-share-dialog.
import { describe, expect, it } from "vitest";
import { resolveShareLanguage } from "./resolveShareLanguage";

describe("resolveShareLanguage", () => {
  it.each([
    ["en", "ru", { language: "en", isPinned: true }],
    ["ru", "en", { language: "ru", isPinned: true }],
    [null, "ru", { language: "ru", isPinned: false }],
    ["de", "ru", { language: "ru", isPinned: false }],
  ])(
    "should resolve pinned %s over interface %s",
    (pinned, interfaceLanguage, expected) => {
      expect(resolveShareLanguage(pinned, interfaceLanguage)).toEqual(expected);
    },
  );
});
