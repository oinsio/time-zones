import { DEFAULT_VIEW_ID, type ViewDefinition } from "./viewDefinition";

/**
 * Chooses the active view: the one the user chose; Cards when none is chosen or
 * the chosen id is not registered; the first view when Cards is not registered.
 * The width and the orientation never choose a view.
 * Implements FR3, FR4, FR5 of add-view-mode-setting-and-grid-skeleton (D1).
 */
export function resolveActiveView(
  registry: readonly ViewDefinition[],
  viewMode: string | null,
): ViewDefinition | undefined {
  return (
    registry.find((view) => view.id === viewMode) ??
    registry.find((view) => view.id === DEFAULT_VIEW_ID) ??
    registry[0]
  );
}
