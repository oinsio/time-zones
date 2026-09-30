import { useTranslation } from "react-i18next";

const PLACEHOLDER_ROW_COUNT = 3;
const PLACEHOLDER_ROWS = Array.from(
  { length: PLACEHOLDER_ROW_COUNT },
  (_, rowNumber) => `placeholder-row-${rowNumber}`,
);

/**
 * Placeholder for the content region while the active view loads.
 * Implements FR5, UX1 of add-main-page-scaffold.
 */
export function ViewSkeleton() {
  const { t } = useTranslation();
  return (
    <div aria-busy="true" className="flex flex-col gap-3 py-4">
      <span className="sr-only">{t("mainPage.loading")}</span>
      {PLACEHOLDER_ROWS.map((rowKey) => (
        <div
          key={rowKey}
          aria-hidden="true"
          className="h-16 animate-pulse rounded-lg bg-muted-foreground/20"
        />
      ))}
    </div>
  );
}
