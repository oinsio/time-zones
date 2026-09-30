import type { ViewDefinition, ViewMode } from "./viewDefinition";

const pickByContainerWidth = (
  registry: readonly ViewDefinition[],
  containerWidth: number,
): ViewDefinition | undefined => {
  const byMinWidthAscending = [...registry].sort(
    (first, second) => first.autoMinWidth - second.autoMinWidth,
  );
  const fittingViews = byMinWidthAscending.filter(
    (view) => view.autoMinWidth <= containerWidth,
  );
  return fittingViews.at(-1) ?? byMinWidthAscending[0];
};

/**
 * Chooses the active view: the requested one, or for AUTO (and for an id that
 * is not registered) the widest view that fits the container, falling back to
 * the narrowest one (ADR-0005).
 * Implements FR2 of add-main-page-scaffold.
 */
export function resolveActiveView(
  registry: readonly ViewDefinition[],
  mode: ViewMode,
  containerWidth: number,
): ViewDefinition | undefined {
  // AUTO is not a view id, so it never matches a registered view.
  const requestedView = registry.find((view) => view.id === mode);
  if (requestedView) return requestedView;
  return pickByContainerWidth(registry, containerWidth);
}
