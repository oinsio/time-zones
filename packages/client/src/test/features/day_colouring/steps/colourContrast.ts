// Implements NFR-A1 of bind-day-periods-to-sun: the contrast of two computed CSS colours.
const RGB_PATTERN = /rgba?\((\d+),\s*(\d+),\s*(\d+)/;
const SRGB_MAX = 255;
const SRGB_LINEAR_THRESHOLD = 0.03928;
const SRGB_LINEAR_DIVISOR = 12.92;
const SRGB_GAMMA_OFFSET = 0.055;
const SRGB_GAMMA_DIVISOR = 1.055;
const SRGB_GAMMA_EXPONENT = 2.4;
const RED_WEIGHT = 0.2126;
const GREEN_WEIGHT = 0.7152;
const BLUE_WEIGHT = 0.0722;
const CONTRAST_OFFSET = 0.05;

const toLinear = (channel: number) => {
  const fraction = channel / SRGB_MAX;
  return fraction <= SRGB_LINEAR_THRESHOLD
    ? fraction / SRGB_LINEAR_DIVISOR
    : ((fraction + SRGB_GAMMA_OFFSET) / SRGB_GAMMA_DIVISOR) **
        SRGB_GAMMA_EXPONENT;
};

const getLuminance = (cssColour: string): number => {
  const match = RGB_PATTERN.exec(cssColour);
  if (match === null) throw new Error(`unreadable colour ${cssColour}`);
  return (
    RED_WEIGHT * toLinear(Number(match[1])) +
    GREEN_WEIGHT * toLinear(Number(match[2])) +
    BLUE_WEIGHT * toLinear(Number(match[3]))
  );
};

/** The WCAG contrast ratio of two computed `rgb(...)` colours. */
export const getContrastRatio = (first: string, second: string): number => {
  const [lighter, darker] = [getLuminance(first), getLuminance(second)].sort(
    (left, right) => right - left,
  );
  return (lighter + CONTRAST_OFFSET) / (darker + CONTRAST_OFFSET);
};
