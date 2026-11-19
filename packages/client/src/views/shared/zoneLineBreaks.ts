/**
 * Which parts of the zone line start a visual line, from the top offsets of
 * the parts in order: the first part always does, a later one does when its
 * top differs from the previous part's. A part that starts a line hides its
 * leading middle dot, so a line never starts or ends with a dot.
 * Implements FR9 of redesign-cards-grid-and-day-palettes (D5).
 */
export function getZoneLinePartLineStarts(
  offsetTops: readonly number[],
): boolean[] {
  return offsetTops.map(
    (offsetTop, partIndex) =>
      partIndex === 0 || offsetTop !== offsetTops[partIndex - 1],
  );
}
