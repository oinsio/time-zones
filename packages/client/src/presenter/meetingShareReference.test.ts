// Verifies FR1 of add-meeting-share-dialog.
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { presentMeetingShareReference } from "./meetingShareReference";

describe("presentMeetingShareReference", () => {
  it.each([
    [
      "ru",
      "воскресенье, 8 марта 2026 г.",
      "Алматы",
      "воскресенье, 8 марта 2026 г. · по времени Алматы",
    ],
    [
      "en",
      "Sunday, March 8, 2026",
      "Almaty",
      "Sunday, March 8, 2026 · Almaty time",
    ],
  ])(
    "should write the %s reference line",
    (language, fullDateLabel, referenceCityLabel, expected) => {
      expect(
        presentMeetingShareReference(
          { fullDateLabel, referenceCityLabel },
          i18n.getFixedT(language),
        ),
      ).toBe(expected);
    },
  );
});
