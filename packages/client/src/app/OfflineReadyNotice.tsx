import { useTranslation } from "react-i18next";
import { Notice } from "./Notice";

interface OfflineReadyNoticeProps {
  onDismiss: () => void;
}

/**
 * Tells the user once that the app now works without network.
 * Implements FR6, UX3 of setup-app-shell-and-pages-deploy.
 */
export function OfflineReadyNotice({ onDismiss }: OfflineReadyNoticeProps) {
  const { t } = useTranslation();
  return <Notice message={t("app.offlineReady")} onDismiss={onDismiss} />;
}
