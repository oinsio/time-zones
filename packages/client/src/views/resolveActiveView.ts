import { DEFAULT_VIEW_ID } from "./viewDefinition";

/**
 * Chooses the active view: the one the user chose; Cards when none is chosen or
 * the chosen id is not registered; the first view when Cards is not registered.
 * The width and the orientation never choose a view.
 * Implements FR3, FR4, FR5 of add-view-mode-setting-and-grid-skeleton (D1).
 * Implements FR17 of add-unix-time-converter-tool (D9): generic over `{ id }`, with the default id as an argument, so the converter view registry shares it.
 */
export function resolveActiveView<View extends { id: string }>(
  registry: readonly View[],
  viewMode: string | null,
  defaultViewId: string = DEFAULT_VIEW_ID,
): View | undefined {
  return (
    registry.find((view) => view.id === viewMode) ??
    registry.find((view) => view.id === defaultViewId) ??
    registry[0]
  );
}
