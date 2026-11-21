import { X } from "lucide-react";
import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui";
import { ZONE_LABEL_PART_ORDER } from "@/constants";
import type { MeetingShareSession } from "@/controller";
import { localeRegistry } from "@/locales";
import { SHARE_ZONE_LABEL_PARTS } from "@/preferences";
import { LanguageGroup } from "./LanguageGroup";
import { MeetingShareLocationRow } from "./MeetingShareLocationRow";
import { MeetingSharePreview } from "./MeetingSharePreview";
import { SettingsToggleGroup } from "./SettingsToggleGroup";
import { ShareLanguagePin } from "./ShareLanguagePin";
import { SHARE_DESTINATION_ICONS } from "./shareDestinationIcons";
import { ZONE_LABEL_PART_LABEL_KEYS } from "./zoneLabelPartLabelKeys";

type MeetingShareDialogProps = {
  session: MeetingShareSession;
  /** Share meeting: the focus returns here when the dialog closes. */
  returnFocusRef: RefObject<HTMLButtonElement | null>;
};

const SHARE_ZONE_LABEL_PARTS_IN_ORDER = ZONE_LABEL_PART_ORDER.filter((part) =>
  SHARE_ZONE_LABEL_PARTS.includes(part),
);

const CAPTION_CLASS_NAME = "text-sm font-semibold text-muted-foreground";
const OPEN_LANGUAGE_LIST_SELECTOR = "button[aria-expanded='true']";

/** Escape in an open language list collapses the list only: the dialog stays. */
const isInsideOpenLanguageList = (event: KeyboardEvent): boolean =>
  event.target instanceof Element &&
  event.target
    .closest("[role='group']")
    ?.querySelector(OPEN_LANGUAGE_LIST_SELECTOR) != null;

/**
 * The share dialog: the locations to invite, the share language with its pin,
 * the share zone label, the preview of the meeting share text and one button
 * per share destination. It formats nothing and names no destination: the
 * session of `useMeetingShare` gives every text. Loaded by `LazyMeetingShareDialog`.
 * Implements FR1–FR6, FR8, FR9, FR11, FR12, UX1–UX5, NFR-A1–NFR-A3, NFR-R1, NFR-R2
 * of add-meeting-share-dialog (D7).
 */
export function MeetingShareDialog({
  session,
  returnFocusRef,
}: MeetingShareDialogProps) {
  const { t } = useTranslation();
  const hasText = session.text !== undefined;
  return (
    <Dialog
      open={session.isShareDialogOpen}
      onOpenChange={(isOpen) => !isOpen && session.closeShareDialog()}
    >
      <DialogContent
        aria-describedby={undefined}
        className="overflow-hidden"
        onEscapeKeyDown={(event) => {
          if (isInsideOpenLanguageList(event)) event.preventDefault();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <DialogTitle className="sr-only">
          {t("meeting.shareDialogTitle")}
        </DialogTitle>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <p className="text-lg font-semibold">{session.title}</p>
            <p className="text-sm text-muted-foreground">
              {session.referenceLine}
            </p>
          </div>
          <DialogClose
            aria-label={t("locations.close")}
            className="flex size-11 shrink-0 items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <X aria-hidden="true" />
          </DialogClose>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          <section className="flex flex-col gap-2">
            <h3 className={CAPTION_CLASS_NAME}>
              {t("meeting.shareDialogRecipients")}
            </h3>
            <ul className="flex flex-col">
              {session.rows.map((row) => (
                <MeetingShareLocationRow
                  key={row.id}
                  row={row}
                  onToggle={session.toggleLocation}
                />
              ))}
            </ul>
          </section>
          <LanguageGroup
            locales={localeRegistry}
            caption={t("meeting.shareDialogLanguage")}
            getButtonLabel={(language) =>
              t("meeting.shareDialogLanguageButton", { language })
            }
            activeCode={session.shareLanguage}
            onChoose={session.chooseShareLanguage}
            besideButton={
              <ShareLanguagePin
                isPinned={session.isShareLanguagePinned}
                onToggle={session.toggleShareLanguagePin}
              />
            }
          />
          <SettingsToggleGroup
            caption={t("meeting.shareDialogZoneLabel")}
            options={SHARE_ZONE_LABEL_PARTS_IN_ORDER.map((part) => ({
              value: part,
              label: t(ZONE_LABEL_PART_LABEL_KEYS[part]),
            }))}
            selectedValues={session.shareZoneLabelParts}
            onToggle={(part) => session.toggleShareZoneLabelPart(part)}
          />
          <MeetingSharePreview text={session.text} />
        </div>
        <div className="flex flex-col gap-2">
          {session.destinations.map(({ id, label }) => {
            const DestinationIcon = SHARE_DESTINATION_ICONS[id];
            return (
              <button
                key={id}
                type="button"
                disabled={!hasText}
                onClick={() => session.share(id)}
                className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 font-semibold text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <DestinationIcon aria-hidden={true} />
                {label}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
