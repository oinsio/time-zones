import { Grid3x3, LayoutGrid } from "lucide-react";
import { createRetryableLazyView } from "./createRetryableLazyView";
import { type ViewDefinition, ViewId } from "./viewDefinition";

export {
  createRetryableLazyView,
  resetLazyView,
} from "./createRetryableLazyView";
export { resolveActiveView } from "./resolveActiveView";
export type { ViewDefinition } from "./viewDefinition";
export { DEFAULT_VIEW_ID, ViewId } from "./viewDefinition";

const cardsView: ViewDefinition = {
  id: ViewId.CARDS,
  titleKey: "views.cardsTitle",
  icon: LayoutGrid,
  component: createRetryableLazyView(() => import("./cards/CardsView")),
};

const gridView: ViewDefinition = {
  id: ViewId.GRID,
  titleKey: "views.gridTitle",
  icon: Grid3x3,
  component: createRetryableLazyView(() => import("./grid/GridView")),
  showsMeetingRange: true,
};

/**
 * Every view the app can show, in display order (ADR-0005). A new view is one
 * entry here plus its folder; the settings list it by itself.
 * Implements FR3 of add-main-page-scaffold; FR2, FR7 of add-view-mode-setting-and-grid-skeleton.
 */
export const viewRegistry: readonly ViewDefinition[] = [cardsView, gridView];
