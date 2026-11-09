import { LocationRowVariant, ViewLocationList } from "@/views/shared";

/**
 * Cards view: the location list with a card for every location.
 * Implements FR7, UX1 of add-main-page-scaffold and the requirements of the
 * shared list (`ViewLocationList`).
 * Implements FR7 of add-view-mode-setting-and-grid-skeleton (D4).
 */
export default function CardsView() {
  return <ViewLocationList rowVariant={LocationRowVariant.CARD} />;
}
