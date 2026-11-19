/**
 * The time text of a location row: the text of the time button, which stands
 * before the location menu in the row's time group. The day period marker is a
 * separate element, so a space is put back before it ("12:30 PM").
 * Implements FR8 of redesign-cards-grid-and-day-palettes (D5).
 */
export function getRowTimeText(row: HTMLElement): string | undefined {
  return row
    .querySelector("[aria-haspopup='menu']")
    ?.parentElement?.previousElementSibling?.textContent?.replace(
      /(\d)(AM|PM)$/,
      "$1 $2",
    );
}
