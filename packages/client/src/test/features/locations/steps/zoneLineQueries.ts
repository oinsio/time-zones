// Implements FR5, FR6 of show-zone-abbreviations-and-zone-label-setting: reads the zone line elements of a rendered row.

/** The zone line of a rendered location row. */
export const ZONE_LINE_SELECTOR = "[data-zone-line]";

/** The texts of the zone line elements of a rendered row, in order. */
export const readZoneLineElements = (row: HTMLElement): string[] => {
  const zoneLine = row.querySelector(ZONE_LINE_SELECTOR);
  return Array.from(zoneLine?.children ?? []).map(
    (element) => element.textContent ?? "",
  );
};
