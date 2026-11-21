import { Pin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/cn";

type ShareLanguagePinProps = {
  isPinned: boolean;
  onToggle: () => void;
};

/**
 * The pin beside the share language: a toggle that keeps the share language in
 * the preferences. Outlined and muted while off, filled in the accent colour
 * while on.
 * Implements FR5, UX2, NFR-A2 of add-meeting-share-dialog (D7).
 */
export function ShareLanguagePin({
  isPinned,
  onToggle,
}: ShareLanguagePinProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      aria-pressed={isPinned}
      aria-label={t("meeting.shareDialogPin")}
      onClick={onToggle}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-md border bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
        isPinned
          ? "border-accent text-accent"
          : "border-control-border text-muted-foreground",
      )}
    >
      <Pin aria-hidden="true" className={cn(isPinned && "fill-current")} />
    </button>
  );
}
