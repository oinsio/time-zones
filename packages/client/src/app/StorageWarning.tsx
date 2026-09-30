import { useTranslation } from "react-i18next";
import { NoticeCard } from "./NoticeCard";

/**
 * Warns that changes will not be saved because local storage is unusable.
 * Lives inside the polite notices region, so it never takes focus.
 * Implements FR9, NFR-A2 of add-main-page-scaffold.
 */
export function StorageWarning() {
  const { t } = useTranslation();
  return (
    <NoticeCard>
      <p>{t("mainPage.storageUnavailable")}</p>
    </NoticeCard>
  );
}
