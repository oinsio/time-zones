export enum MenuStepDirection {
  NEXT = "NEXT",
  PREVIOUS = "PREVIOUS",
}

const STEP_BY_DIRECTION: Record<MenuStepDirection, number> = {
  [MenuStepDirection.NEXT]: 1,
  [MenuStepDirection.PREVIOUS]: -1,
};

/**
 * The enabled menu item reached by stepping from `fromIndex`, wrapping round
 * and skipping disabled items; `fromIndex` itself when no other item is enabled.
 * Starting just outside the list (-1 going next, the length going previous)
 * finds the first or the last enabled item.
 * Implements FR16, NFR-A3 of redesign-cards-grid-and-day-palettes (D6).
 */
export function getEnabledMenuIndex(
  disabledFlags: readonly boolean[],
  fromIndex: number,
  direction: MenuStepDirection,
): number {
  const count = disabledFlags.length;
  const step = STEP_BY_DIRECTION[direction];
  for (let distance = 1; distance <= count; distance += 1) {
    const candidate = (((fromIndex + step * distance) % count) + count) % count;
    if (!disabledFlags[candidate]) return candidate;
  }
  return fromIndex;
}
