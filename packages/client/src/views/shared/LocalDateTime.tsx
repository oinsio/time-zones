import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MeetingRangeInputOutcome,
  type WallTimeInputOutcome,
} from "@/controller";
import type { LocationRow, PresentedLocationMeetingRange } from "@/presenter";
import {
  LOCATION_ROW_VARIANT_CLASS_NAMES,
  LocationRowVariant,
} from "./locationRowVariant";
import { MeetingRangeInput } from "./MeetingRangeInput";
import { WallTimeInput } from "./WallTimeInput";

type LocalDateTimeProps = Pick<
  LocationRow,
  "localTimeLabel" | "localDateLabel" | "localIsoDate" | "wallTimeInputLabel"
> & {
  /** `date` is the local ISO date the row showed when the field opened. */
  onConfirmWallTime: (text: string, date: string) => WallTimeInputOutcome;
  /** Cards when omitted. */
  rowVariant?: LocationRowVariant;
  /** The city the meeting range input is named after. */
  cityLabel?: string;
  /** Confirms the typed start and end; `date` is the local ISO date the row showed when the input opened. */
  onConfirmMeetingRange?: (
    startText: string,
    endText: string,
    date: string,
  ) => MeetingRangeInputOutcome;
  /** The meeting range's local span and day shift mark; the span replaces the time. */
  meetingRange?: PresentedLocationMeetingRange;
};

/** The input a row has open: which kind and the local ISO date the row showed when it opened. */
type OpenedInput = { date: string; isMeetingRangeInput: boolean };

const TIME_CLASS_NAMES = "text-2xl md:text-4xl";
const MEETING_SPAN_CLASS_NAMES = "text-xl text-meeting-text md:text-[26px]";

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
 * Implements FR8, UX1 of add-grid-meeting-range-and-share (D8): the local span in place of the time and the day shift mark before the date.
 * Implements FR8, UX3 of fix-grid-meeting-range-lock-and-layering (D6): the surface lies behind the label only.
 * Implements FR1, FR3, FR4, UX1, UX2 of fix-grid-meeting-range-lock-and-layering (D1, D4): the span opens the meeting range input; a wall-time input never opens while a meeting range is set.
 */
export function LocalDateTime({
  localTimeLabel,
  localDateLabel,
  localIsoDate,
  wallTimeInputLabel,
  cityLabel = "",
  onConfirmWallTime,
  onConfirmMeetingRange,
  rowVariant = LocationRowVariant.CARD,
  meetingRange,
}: LocalDateTimeProps) {
  const variantClassNames = LOCATION_ROW_VARIANT_CLASS_NAMES[rowVariant];
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const isFocusReturnDue = useRef(false);
  const { t } = useTranslation();
  const isMeetingRangeSet = meetingRange !== undefined;
  const [opened, setOpened] = useState<OpenedInput | undefined>();
  // An input of the other kind, left open when the meeting range appeared or ended, closes unconfirmed.
  const openedDate =
    opened?.isMeetingRangeInput === isMeetingRangeSet ? opened.date : undefined;
  useEffect(() => {
    if (opened !== undefined && openedDate === undefined) setOpened(undefined);
  }, [opened, openedDate]);
  useEffect(() => {
    if (openedDate === undefined && isFocusReturnDue.current) {
      isFocusReturnDue.current = false;
      buttonRef.current?.focus();
    }
  }, [openedDate]);
  if (localTimeLabel === "") return null;
  const closeField = (shouldRestoreFocus: boolean) => {
    isFocusReturnDue.current = shouldRestoreFocus;
    setOpened(undefined);
  };
  const dateElement = (
    <time
      dateTime={localIsoDate}
      className="bg-surface text-sm text-muted-foreground"
    >
      {localDateLabel}
    </time>
  );
  const dayShiftMark = meetingRange?.dayShiftLabel !== undefined && (
    <span className="bg-surface text-sm font-bold text-danger">
      {meetingRange.dayShiftLabel}
    </span>
  );
  const dateWithMark = dayShiftMark ? (
    <span className="flex items-baseline gap-x-1">
      {dayShiftMark}
      {dateElement}
    </span>
  ) : (
    dateElement
  );
  const buttonLabel =
    meetingRange === undefined
      ? wallTimeInputLabel
      : t("meeting.rangeInputLabel", {
          city: cityLabel,
          span: meetingRange.spanLabel,
        });
  const timeClassName =
    meetingRange === undefined ? TIME_CLASS_NAMES : MEETING_SPAN_CLASS_NAMES;
  return (
    <span className={`flex shrink-0 items-end ${variantClassNames.dateTime}`}>
      {variantClassNames.isDateBeforeTime && dateWithMark}
      {openedDate === undefined ? (
        <button
          ref={buttonRef}
          type="button"
          aria-label={buttonLabel}
          onClick={() =>
            setOpened({
              date: localIsoDate,
              isMeetingRangeInput: isMeetingRangeSet,
            })
          }
          className={`min-h-11 min-w-11 cursor-text rounded-md font-bold leading-none whitespace-nowrap tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${timeClassName}`}
        >
          <span className="bg-surface">
            {meetingRange?.spanLabel ?? localTimeLabel}
          </span>
        </button>
      ) : meetingRange === undefined ? (
        <WallTimeInput
          label={wallTimeInputLabel}
          initialText={localTimeLabel}
          onConfirm={(text) => onConfirmWallTime(text, openedDate)}
          onClose={closeField}
        />
      ) : (
        <MeetingRangeInput
          city={cityLabel}
          initialStartText={meetingRange.startTimeLabel}
          initialEndText={meetingRange.endTimeLabel}
          onConfirm={(startText, endText) =>
            onConfirmMeetingRange?.(startText, endText, openedDate) ??
            MeetingRangeInputOutcome.CLOSED
          }
          onClose={closeField}
        />
      )}
      {!variantClassNames.isDateBeforeTime && dateWithMark}
    </span>
  );
}
