import { useTranslation } from "react-i18next";
import { RowSkeleton } from "@/views/shared";

/**
 * Placeholder for the content region while the active view loads.
 * Implements FR5, UX1 of add-main-page-scaffold.
 */
export function ViewSkeleton() {
  const { t } = useTranslation();
  return (
    <div aria-busy="true" className="flex flex-col gap-3 py-4">
      <span className="sr-only">{t("mainPage.loading")}</span>
      <RowSkeleton />
    </div>
  );
}
