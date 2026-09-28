import { useTranslation } from "react-i18next";
import { Notice } from "./Notice";
import { NoticeButton } from "./NoticeButton";

interface UpdateNoticeProps {
  onReload: () => void;
  onDismiss: () => void;
}

/**
 * Offers to reload into a waiting new version; never reloads by itself.
 * Implements FR7 of setup-app-shell-and-pages-deploy.
 */
export function UpdateNotice({ onReload, onDismiss }: UpdateNoticeProps) {
  const { t } = useTranslation();
  return (
    <Notice
      message={t("app.updateAvailable")}
      onDismiss={onDismiss}
      actions={
        <NoticeButton onClick={onReload}>{t("app.reload")}</NoticeButton>
      }
    />
  );
}
