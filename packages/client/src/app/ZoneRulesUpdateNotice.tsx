import { useTranslation } from "react-i18next";
import { Notice } from "./Notice";
import { NoticeButton } from "./NoticeButton";

interface ZoneRulesUpdateNoticeProps {
  release: string;
  onReload: () => void;
  onDismiss: () => void;
}

/**
 * Says that a newer zone rules release is stored and Reload will use it;
 * never reloads by itself.
 * Implements FR7, UX1, UX2 of add-remote-zone-rules-updates (design D5).
 */
export function ZoneRulesUpdateNotice({
  release,
  onReload,
  onDismiss,
}: ZoneRulesUpdateNoticeProps) {
  const { t } = useTranslation();
  return (
    <Notice
      message={t("app.zoneRulesReady", { release })}
      onDismiss={onDismiss}
      actions={
        <NoticeButton onClick={onReload}>{t("app.reload")}</NoticeButton>
      }
    />
  );
}
