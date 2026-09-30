import { useTranslation } from "react-i18next";
import { NoticeButton } from "./NoticeButton";

interface ViewErrorFallbackProps {
  onRetry: () => void;
}

/**
 * Error state of the content region: announced as an alert without moving
 * focus, with a Retry action reachable by keyboard.
 * Implements FR6, NFR-A2, UX1 of add-main-page-scaffold.
 */
export function ViewErrorFallback({ onRetry }: ViewErrorFallbackProps) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="flex flex-col items-start gap-2 py-4">
      <p>{t("mainPage.viewError")}</p>
      <NoticeButton onClick={onRetry}>{t("mainPage.retry")}</NoticeButton>
    </div>
  );
}
