import { useEffect, useId, useRef, useState } from "react";
import type { WallTimeInputOutcome } from "@/controller";
import type { PresentedConverterRow } from "@/presenter/unixTime";
import {
  CalendarDialog,
  LocationMarkIcon,
  WallTimeHint,
  WallTimeInput,
  ZoneLine,
} from "../../shared";

type ConverterRowProps = {
  row: PresentedConverterRow;
  onConfirmTime: (text: string) => WallTimeInputOutcome;
  onSelectDate: (isoDate: string) => void;
};

/**
 * One row of the converter: the mark, the city, the zone line, the date button
 * that opens the calendar, and the exact time, which opens a field that reads
 * seconds and a fraction. The time is not a live region, so second ticks are
 * not announced.
 * Implements FR9, FR10, FR11, NFR-A2, NFR-A3, UX1 of add-unix-time-converter-tool (D6, D7).
 */
export function ConverterRow({
  row,
  onConfirmTime,
  onSelectDate,
}: ConverterRowProps) {
  const markId = useId();
  const [isEditing, setIsEditing] = useState(false);
  const timeButtonRef = useRef<HTMLButtonElement | null>(null);
  const isFocusReturnDue = useRef(false);

  useEffect(() => {
    if (isEditing || !isFocusReturnDue.current) return;
    isFocusReturnDue.current = false;
    timeButtonRef.current?.focus();
  }, [isEditing]);

  const closeField = (shouldRestoreFocus: boolean) => {
    isFocusReturnDue.current = shouldRestoreFocus;
    setIsEditing(false);
  };

  return (
    <li className="flex min-w-0 flex-col gap-2 rounded-card border border-card-border bg-surface px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        {row.mark && <LocationMarkIcon mark={row.mark} id={markId} />}
        <span className="min-w-0 truncate text-lg font-bold">
          {row.cityLabel}
        </span>
      </div>
      <ZoneLine
        parts={row.zoneLineParts}
        className="text-sm text-muted-foreground"
      />
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <CalendarDialog
          dateBar={{
            chooseDateLabel: row.dateButtonLabel,
            isoDate: row.localIsoDate,
            shortLabel: row.dateLabel,
            longLabel: row.dateLabel,
          }}
          onSelectDate={onSelectDate}
        />
        {isEditing ? (
          <WallTimeInput
            label={row.timeInputLabel}
            initialText={row.timeLabel}
            onConfirm={onConfirmTime}
            onClose={closeField}
            sizeClassName="text-lg"
            widthClassName="w-48"
            hasSeconds
          />
        ) : (
          <button
            ref={timeButtonRef}
            type="button"
            aria-label={row.timeInputLabel}
            onClick={() => setIsEditing(true)}
            className="min-h-11 min-w-11 cursor-text rounded-md text-lg font-bold leading-none whitespace-nowrap tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {row.timeLabel}
          </button>
        )}
      </div>
      {row.wallTimeHint && <WallTimeHint text={row.wallTimeHint} />}
    </li>
  );
}
