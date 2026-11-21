import { useId } from "react";
import { useTranslation } from "react-i18next";
import { MEETING_SHARE_LINE_SEPARATOR } from "@/constants";

type MeetingSharePreviewProps = {
  /** The meeting share text; `undefined` when no location is ticked. */
  text: string | undefined;
};

/**
 * The preview of the meeting share text, line by line with the heading in
 * bold, or the hint when no location is ticked. A region named by its caption,
 * not a live region.
 * Implements FR8, UX4, NFR-A2 of add-meeting-share-dialog (D7).
 */
export function MeetingSharePreview({ text }: MeetingSharePreviewProps) {
  const { t } = useTranslation();
  const captionId = useId();
  const [heading, ...locationLines] =
    text?.split(MEETING_SHARE_LINE_SEPARATOR) ?? [];
  return (
    <section aria-labelledby={captionId} className="flex flex-col gap-2">
      <h3
        id={captionId}
        className="text-sm font-semibold text-muted-foreground"
      >
        {t("meeting.shareDialogPreview")}
      </h3>
      <div className="rounded-lg border border-card-border bg-background p-3">
        {text === undefined ? (
          <p className="text-muted-foreground">
            {t("meeting.shareDialogNoLocationHint")}
          </p>
        ) : (
          <>
            <p className="font-bold">{heading}</p>
            {locationLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
