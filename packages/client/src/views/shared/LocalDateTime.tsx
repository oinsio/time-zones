import type { LocationRow } from "@/presenter";

type LocalDateTimeProps = Pick<
  LocationRow,
  "localTimeLabel" | "localDateLabel" | "localIsoDate"
>;

/**
 * Local time with the date under it; renders nothing when the time cannot be
 * computed. Not a live region, so minute updates are not announced.
 * Implements FR2, FR6, UX1, UX2, NFR-A2 of
 * show-local-time-and-date-on-location-cards (D5).
 */
export function LocalDateTime({
  localTimeLabel,
  localDateLabel,
  localIsoDate,
}: LocalDateTimeProps) {
  if (localTimeLabel === "") return null;
  return (
    <span className="flex shrink-0 flex-col items-end md:items-start">
      <span className="text-2xl font-bold leading-none tabular-nums md:text-4xl">
        {localTimeLabel}
      </span>
      <time dateTime={localIsoDate} className="text-sm text-muted-foreground">
        {localDateLabel}
      </time>
    </span>
  );
}
