// Verifies FR5 of polish-settings-and-remove-offline-update-notice.
import i18n from "i18next";
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { HourFormat } from "@/preferences";
import { startWorkCount } from "@/test/workCounters";
import { formatDeployTime } from "./deployTime";

const DEPLOY_INSTANT = Temporal.Instant.from("2026-03-08T07:30:00.000Z");
const normalizeSpaces = (text: string) => text.replace(/[\u202F\u00A0]/g, " ");

function deployTimeOf(
  language: string,
  hourFormat: HourFormat,
  deviceTimeZoneId = "UTC",
) {
  return normalizeSpaces(
    formatDeployTime({
      deployInstant: DEPLOY_INSTANT,
      deviceTimeZoneId,
      language,
      hourFormat,
      translate: i18n.getFixedT(language),
    }),
  );
}

describe("formatDeployTime", () => {
  it.each([
    ["en", HourFormat.H24, "UTC", "Deployed March 8, 2026 at 07:30"],
    ["en", HourFormat.H12, "UTC", "Deployed March 8, 2026 at 7:30 AM"],
    ["ru", HourFormat.H24, "UTC", "Развёрнуто 8 марта 2026 г. в 07:30"],
    ["en", HourFormat.H24, "Asia/Kolkata", "Deployed March 8, 2026 at 13:00"],
  ])(
    "should write %s %s in %s as %s",
    (language, hourFormat, zone, expected) => {
      expect(deployTimeOf(language, hourFormat, zone)).toBe(expected);
    },
  );

  it("should build no formatter for a second call with the same settings", () => {
    deployTimeOf("en", HourFormat.H24);
    const workCount = startWorkCount();
    deployTimeOf("en", HourFormat.H24);
    workCount.stop();
    expect(workCount.formatters()).toBe(0);
  });
});
