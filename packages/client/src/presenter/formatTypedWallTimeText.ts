import {
  DIGITS_ONLY_PATTERN,
  DOUBLE_DIGIT_HOUR_LENGTH,
  SINGLE_DIGIT_HOUR_LENGTH,
  SINGLE_DIGIT_HOUR_MIN_FIRST_DIGIT,
  SINGLE_DIGIT_HOUR_MIN_SECOND_DIGIT_AFTER_TWENTY,
  TWENTY_HOUR_PREFIX_DIGIT,
  WALL_TIME_SEPARATOR,
} from "@/constants";

const getHourLength = (digits: string): number => {
  const firstDigit = Number(digits[0]);
  if (firstDigit >= SINGLE_DIGIT_HOUR_MIN_FIRST_DIGIT) {
    return SINGLE_DIGIT_HOUR_LENGTH;
  }
  const isTwentyPrefix = firstDigit === TWENTY_HOUR_PREFIX_DIGIT;
  const secondDigit = Number(digits[SINGLE_DIGIT_HOUR_LENGTH]);
  return isTwentyPrefix &&
    secondDigit >= SINGLE_DIGIT_HOUR_MIN_SECOND_DIGIT_AFTER_TWENTY
    ? SINGLE_DIGIT_HOUR_LENGTH
    : DOUBLE_DIGIT_HOUR_LENGTH;
};

/**
 * The text of a time typed digit by digit, with the `:` inserted after the
 * hour. A text that is not digits only stays as typed.
 * Implements FR6 of refine-meeting-range-entry-and-handles (D4).
 */
export function formatTypedWallTimeText(text: string): string {
  if (!DIGITS_ONLY_PATTERN.test(text)) return text;
  const hourLength = getHourLength(text);
  if (text.length <= hourLength) return text;
  return `${text.slice(0, hourLength)}${WALL_TIME_SEPARATOR}${text.slice(hourLength)}`;
}
