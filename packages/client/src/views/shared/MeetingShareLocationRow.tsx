import { Check } from "lucide-react";
import { useId } from "react";
import type { MeetingShareDialogRow } from "@/controller";
import { cn } from "@/shared/lib/cn";
import { ZoneLine } from "./ZoneLine";

type MeetingShareLocationRowProps = {
  row: MeetingShareDialogRow;
  onToggle: (locationId: string) => void;
};

/**
 * A location of the share dialog: a checkbox, the city label with its zone
 * parts, the local span and the local date with the day shift. A row offers its
 * checkbox and no remove control; an unticked row is muted.
 * Implements FR2, FR3, UX3, UX5 of add-meeting-share-dialog (D7).
 */
export function MeetingShareLocationRow({
  row,
  onToggle,
}: MeetingShareLocationRowProps) {
  const cityLabelId = useId();
  const mutedClassName = row.isIncluded ? undefined : "text-muted-foreground";
  const dateLabel = [row.dayShiftLabel, row.localDateLabel]
    .filter((part) => part !== undefined)
    .join(" ");
  return (
    <li>
      <label className="flex min-h-11 items-center gap-2">
        <span className="relative flex size-11 shrink-0 items-center justify-center">
          <input
            type="checkbox"
            checked={row.isIncluded}
            aria-labelledby={cityLabelId}
            onChange={() => onToggle(row.id)}
            className="peer absolute inset-0 size-full cursor-pointer opacity-0"
          />
          <span
            aria-hidden="true"
            className="flex size-6 items-center justify-center rounded-sm border border-control-border bg-surface text-accent-foreground peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent"
          >
            {row.isIncluded && <Check className="size-4" />}
          </span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span
            id={cityLabelId}
            className={cn("font-semibold", mutedClassName)}
          >
            {row.cityLabel}
          </span>
          {row.zoneParts.length > 0 && (
            <ZoneLine
              parts={row.zoneParts}
              className="text-sm text-muted-foreground"
            />
          )}
        </span>
        <span className="flex flex-col items-end text-right">
          <span className={cn("text-meeting-text", mutedClassName)}>
            {row.spanLabel}
          </span>
          <span className="text-sm text-muted-foreground">{dateLabel}</span>
        </span>
      </label>
    </li>
  );
}
