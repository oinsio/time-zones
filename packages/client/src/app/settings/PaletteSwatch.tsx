import { DayPalette } from "@/preferences";

const STRIPE_CLASS_NAMES: Record<DayPalette, readonly string[]> = {
  [DayPalette.VIVID]: [
    "bg-[var(--color-day-vivid-night)]",
    "bg-[var(--color-day-vivid-morning)]",
    "bg-[var(--color-day-vivid-daylight)]",
    "bg-[var(--color-day-vivid-evening)]",
  ],
  [DayPalette.MUTED]: [
    "bg-[var(--color-day-muted-night)]",
    "bg-[var(--color-day-muted-morning)]",
    "bg-[var(--color-day-muted-daylight)]",
    "bg-[var(--color-day-muted-evening)]",
  ],
};

/**
 * The palette swatch of a day palette option: a square split into four equal
 * stripes in the night, morning, day and evening colours of that palette, in
 * the active theme, with an outline in the surface colour.
 * Implements FR5, UX2 of redesign-cards-grid-and-day-palettes (D3).
 */
export function PaletteSwatch({ dayPalette }: { dayPalette: DayPalette }) {
  return (
    <span className="flex h-6 w-6 overflow-hidden rounded-[5px] outline outline-2 -outline-offset-2 outline-surface">
      {STRIPE_CLASS_NAMES[dayPalette].map((stripeClassName) => (
        <span key={stripeClassName} className={`flex-1 ${stripeClassName}`} />
      ))}
    </span>
  );
}
