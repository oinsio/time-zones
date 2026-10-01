/**
 * The 0-based index a dropped row moves to, or `undefined` when the drop
 * changes nothing: outside the list, over itself or over an unknown row.
 * Implements FR3 of reorder-locations-by-drag-and-drop (D5).
 */
export function getMoveTargetIndex(
  rows: readonly { id: string }[],
  activeId: string,
  overId: string | undefined,
): number | undefined {
  if (overId === activeId) return undefined;
  const targetIndex = rows.findIndex((row) => row.id === overId);
  return targetIndex === -1 ? undefined : targetIndex;
}
