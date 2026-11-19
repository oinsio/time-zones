// Implements FR5, FR6 of show-zone-abbreviations-and-zone-label-setting: reads the zone line elements of a rendered row.

/** The zone line of a rendered location row. */
export const ZONE_LINE_SELECTOR = "[data-zone-line]";

/** The texts of the zone line elements of a rendered row, in order, without the middle dots (FR9 of redesign-cards-grid-and-day-palettes). */
export const readZoneLineElements = (row: HTMLElement): string[] => {
  const zoneLine = row.querySelector(ZONE_LINE_SELECTOR);
  return Array.from(zoneLine?.children ?? []).map((element) => {
    const copy = element.cloneNode(true) as HTMLElement;
    copy.querySelector("[data-zone-line-dot]")?.remove();
    return copy.textContent ?? "";
  });
};
