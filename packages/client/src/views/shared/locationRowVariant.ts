/**
 * How a view shows one location row: a card of its own, or a row of the grid panel.
 * Implements FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4).
 */
export enum LocationRowVariant {
  CARD = "card",
  GRID_ROW = "grid-row",
}

type LocationRowVariantClassNames = {
  /** The `<ul>` around the rows. */
  list: string;
  /** The row `<li>`, besides the classes every row shares. */
  row: string;
  /** The block holding the place column and the local time. */
  placeAndTime: string;
  /** The place column: the city line and the zone line. */
  place: string;
  /** The local time and date column. */
  dateTime: string;
  /** Whether the date comes before the time button in the reading order. */
  isDateBeforeTime: boolean;
  /** Whether the row shows the day track under or beside its header. */
  hasDayTrack: boolean;
};

/**
 * The classes that differ between the variants, in one place so the shared
 * row components look them up instead of branching. The Grid design:
 * `docs/architecture/views.md` → Grid → Row header.
 * Implements FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4).
 */
export const LOCATION_ROW_VARIANT_CLASS_NAMES: Record<
  LocationRowVariant,
  LocationRowVariantClassNames
> = {
  [LocationRowVariant.CARD]: {
    list: "flex flex-col gap-2",
    row: "rounded-md border border-border",
    placeAndTime: "md:flex-none",
    place: "md:w-64 md:flex-none",
    dateTime: "md:w-44 md:items-start",
    isDateBeforeTime: false,
    hasDayTrack: true,
  },
  [LocationRowVariant.GRID_ROW]: {
    list: "rounded-md border border-border divide-y divide-border",
    row: "first:rounded-t-md last:rounded-b-md",
    placeAndTime: "md:flex-1",
    place: "md:flex-1 md:flex-row md:items-baseline md:gap-x-2",
    dateTime: "md:flex-row md:items-baseline md:gap-x-3",
    isDateBeforeTime: true,
    hasDayTrack: false,
  },
};
