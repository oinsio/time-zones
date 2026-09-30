import { useTranslation } from "react-i18next";
import { NoticeCard } from "./NoticeCard";

/**
 * Tells the user the latest version could not be fetched. Lives inside the
 * polite notices region, so it is announced without taking focus; the host
 * removes it when the connection returns.
 * Implements FR8, NFR-A2 of add-main-page-scaffold.
 */
export function UpdateCheckFailedNote() {
  const { t } = useTranslation();
  return (
    <NoticeCard>
      <p>{t("mainPage.updateCheckFailed")}</p>
    </NoticeCard>
  );
}
