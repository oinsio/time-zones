import { useEffect, useRef, useState } from "react";
import type { WallTimeInputOutcome } from "@/controller";
import type { LocationRow } from "@/presenter";
import {
  LOCATION_ROW_VARIANT_CLASS_NAMES,
  LocationRowVariant,
} from "./locationRowVariant";
import { WallTimeInput } from "./WallTimeInput";

type LocalDateTimeProps = Pick<
  LocationRow,
  "localTimeLabel" | "localDateLabel" | "localIsoDate" | "wallTimeInputLabel"
> & {
  /** `date` is the local ISO date the row showed when the field opened. */
  onConfirmWallTime: (text: string, date: string) => WallTimeInputOutcome;
  /** Cards when omitted. */
  rowVariant?: LocationRowVariant;
};

/**
 * Local time with the date under it; renders nothing when the time cannot be
 * computed. The time is a button that opens the wall-time input; it opens on
 * a plain click, so it works without Pointer Events. Not a live region, so
 * minute updates are not announced.
 * Implements FR2, FR6, UX1, UX2, NFR-A2 of
 * show-local-time-and-date-on-location-cards (D5).
 * Implements FR1, FR5, FR13, NFR-A2, UX1 of add-wall-time-input-with-hint (D6).
 * Implements FR5, UX3 of fix-location-card-and-header-layout (D4): a fixed
 * column width from 768 px, so every track is equally long.
 * Implements FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4): in a
 * grid row the date comes first and the date and time sit in one line from 768 px.
 */
export function LocalDateTime({
  localTimeLabel,
  localDateLabel,
  localIsoDate,
  wallTimeInputLabel,
  onConfirmWallTime,
  rowVariant = LocationRowVariant.CARD,
}: LocalDateTimeProps) {
  const variantClassNames = LOCATION_ROW_VARIANT_CLASS_NAMES[rowVariant];
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const isFocusReturnDue = useRef(false);
  const [openedDate, setOpenedDate] = useState<string | undefined>();
  useEffect(() => {
    if (openedDate === undefined && isFocusReturnDue.current) {
      isFocusReturnDue.current = false;
      buttonRef.current?.focus();
    }
  }, [openedDate]);
  if (localTimeLabel === "") return null;
  const closeField = (shouldRestoreFocus: boolean) => {
    isFocusReturnDue.current = shouldRestoreFocus;
    setOpenedDate(undefined);
  };
  const dateElement = (
    <time dateTime={localIsoDate} className="text-sm text-muted-foreground">
      {localDateLabel}
    </time>
  );
  return (
    <span
      className={`flex shrink-0 flex-col items-end ${variantClassNames.dateTime}`}
    >
      {variantClassNames.isDateBeforeTime && dateElement}
      {openedDate === undefined ? (
        <button
          ref={buttonRef}
          type="button"
          aria-label={wallTimeInputLabel}
          onClick={() => setOpenedDate(localIsoDate)}
          className="min-h-11 min-w-11 cursor-text rounded-md text-2xl font-bold leading-none whitespace-nowrap tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:text-4xl"
        >
          {localTimeLabel}
        </button>
      ) : (
        <WallTimeInput
          label={wallTimeInputLabel}
          initialText={localTimeLabel}
          onConfirm={(text) => onConfirmWallTime(text, openedDate)}
          onClose={closeField}
        />
      )}
      {!variantClassNames.isDateBeforeTime && dateElement}
    </span>
  );
}
