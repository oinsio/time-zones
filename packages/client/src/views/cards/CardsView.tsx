import { useTranslation } from "react-i18next";

/**
 * Cards view skeleton: no model exists yet, so it shows only the empty state
 * and no action (nothing to add locations with until search exists).
 * Implements FR7, UX1 of add-main-page-scaffold.
 */
export default function CardsView() {
  const { t } = useTranslation();
  return (
    <p className="py-8 text-center text-muted-foreground">
      {t("views.cardsEmptyState")}
    </p>
  );
}
