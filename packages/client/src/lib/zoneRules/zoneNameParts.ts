/**
 * The zone name the wrapper puts into formatted text: the tzdb designation when
 * it is letters alone, otherwise `GMT±H` or `GMT±H:MM` from the offset.
 * Implements FR6 of add-zone-rules-from-iana (design D5).
 */
import {
  GMT_ZONE_NAME_PREFIX,
  LETTERS_ONLY_DESIGNATION,
  MINUTES_PER_HOUR,
} from "@/constants";
import { type LocalTimeType, SECONDS_PER_MINUTE } from "./core/index.ts";

const ZONE_NAME_PART_TYPE = "timeZoneName";
const OFFSET_MINUTES_SEPARATOR = ":";
const OFFSET_MINUTES_DIGITS = 2;

function formatGmtOffset(utcOffsetSeconds: number): string {
  const totalMinutes = Math.round(
    Math.abs(utcOffsetSeconds) / SECONDS_PER_MINUTE,
  );
  if (totalMinutes === 0) return GMT_ZONE_NAME_PREFIX;
  const sign = utcOffsetSeconds < 0 ? "-" : "+";
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  const minutesText =
    minutes === 0
      ? ""
      : `${OFFSET_MINUTES_SEPARATOR}${String(minutes).padStart(OFFSET_MINUTES_DIGITS, "0")}`;
  return `${GMT_ZONE_NAME_PREFIX}${sign}${hours}${minutesText}`;
}

export function formatZoneName(localTimeType: LocalTimeType): string {
  return LETTERS_ONLY_DESIGNATION.test(localTimeType.designation)
    ? localTimeType.designation
    : formatGmtOffset(localTimeType.utcOffsetSeconds);
}

/** The parts with the native UTC zone name replaced by the zone's own name. */
export function replaceZoneNameParts<Part extends Intl.DateTimeFormatPart>(
  parts: Part[],
  zoneName: string,
): Part[] {
  return parts.map((part) =>
    part.type === ZONE_NAME_PART_TYPE ? { ...part, value: zoneName } : part,
  );
}
