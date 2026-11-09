import { LocationRowVariant, ViewLocationList } from "@/views/shared";

/**
 * Grid view skeleton: the location list as rows of one panel with the shared
 * row headers; the hour cells follow in a later change.
 * Implements FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4).
 */
export default function GridView() {
  return <ViewLocationList rowVariant={LocationRowVariant.GRID_ROW} />;
}
