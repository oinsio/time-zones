import type { TFunction } from "i18next";
import {
  OFFSET_DIFFERENCE_DURATION_SEPARATOR,
  OFFSET_DIFFERENCE_ZERO_VALUE,
} from "@/constants";
import { formatSignedHoursMinutes } from "./utcOffset";

export type PresentedOffsetDifference = {
  /** "−2 h", "+0:30", "0 h": the visible text, hidden from assistive technology. */
  label: string;
  /** "2 hours behind", "same time": read as part of the row name. */
  accessibleLabel: string;
};

function formatDuration(
  hours: number,
  minutes: number,
  translate: TFunction,
): string {
  const parts: string[] = [];
  if (hours > 0)
    parts.push(translate("locations.durationHours", { count: hours }));
  if (minutes > 0) {
    parts.push(translate("locations.durationMinutes", { count: minutes }));
  }
  return parts.join(OFFSET_DIFFERENCE_DURATION_SEPARATOR);
}

/**
 * Visible and accessible text of an offset difference in minutes. The sign,
 * hours and minutes come from `formatSignedHoursMinutes`, shared with
 * `formatUtcOffset`.
 * Implements FR6, NFR-A3 of set-home-location-and-show-differences (D5).
 */
export function formatOffsetDifference(
  differenceMinutes: number,
  translate: TFunction,
): PresentedOffsetDifference {
  if (differenceMinutes === 0) {
    return {
      label: translate("locations.offsetDifferenceHours", {
        value: OFFSET_DIFFERENCE_ZERO_VALUE,
      }),
      accessibleLabel: translate("locations.offsetDifferenceSame"),
    };
  }
  const { sign, hours, minutes, minutesPart } =
    formatSignedHoursMinutes(differenceMinutes);
  const signedValue = `${sign}${hours}${minutesPart}`;
  const duration = formatDuration(hours, minutes, translate);
  return {
    label:
      minutesPart === ""
        ? translate("locations.offsetDifferenceHours", { value: signedValue })
        : signedValue,
    accessibleLabel: translate(
      differenceMinutes > 0
        ? "locations.offsetDifferenceAhead"
        : "locations.offsetDifferenceBehind",
      { duration },
    ),
  };
}
