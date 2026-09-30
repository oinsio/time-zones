import { LayoutGrid } from "lucide-react";
import { createRetryableLazyView } from "./createRetryableLazyView";
import { AutoViewMode, type ViewDefinition, ViewId } from "./viewDefinition";

export {
  createRetryableLazyView,
  resetLazyView,
} from "./createRetryableLazyView";
export { resolveActiveView } from "./resolveActiveView";
export type { ViewDefinition, ViewMode } from "./viewDefinition";
export { AutoViewMode, ViewId } from "./viewDefinition";

const CARDS_AUTO_MIN_WIDTH = 0;

const cardsView: ViewDefinition = {
  id: ViewId.CARDS,
  titleKey: "views.cardsTitle",
  icon: LayoutGrid,
  component: createRetryableLazyView(() => import("./cards/CardsView")),
  autoMinWidth: CARDS_AUTO_MIN_WIDTH,
};

/**
 * Every view the app can show (ADR-0005). A new view is one entry here plus
 * its folder.
 * Implements FR3 of add-main-page-scaffold.
 */
export const viewRegistry: readonly ViewDefinition[] = [cardsView];
