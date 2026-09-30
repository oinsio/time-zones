/** Structural view shape: this module imports nothing from `src/` (D12). */
export type ContractViewportView = { id: string; autoMinWidth: number };

export const CONTRACT_MAX_VIEWPORT_WIDTH_PX = 1280;
export const CONTRACT_MIN_VIEWPORT_WIDTH_PX = 320;

/**
 * The widest viewport at which AUTO can still pick `view`: one less than the
 * smallest `autoMinWidth` above the view's, within the contract limits.
 * Implements D12 of add-locations-via-search.
 */
export function getContractViewportWidth(
  view: ContractViewportView,
  registry: readonly ContractViewportView[],
): number {
  const widerMinimums = registry
    .map((candidate) => candidate.autoMinWidth)
    .filter((minWidth) => minWidth > view.autoMinWidth);
  const widestPickingView =
    widerMinimums.length === 0
      ? CONTRACT_MAX_VIEWPORT_WIDTH_PX
      : Math.min(...widerMinimums) - 1;
  return Math.max(
    CONTRACT_MIN_VIEWPORT_WIDTH_PX,
    Math.min(CONTRACT_MAX_VIEWPORT_WIDTH_PX, widestPickingView),
  );
}
