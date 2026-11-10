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
  /** The box around the row header; none where the row header needs none. */
  headerBox?: string;
  /** The box around the row notes; none where the notes need none. */
  notesBox?: string;
  /** The block holding the place column and the local time. */
  placeAndTime: string;
  /** The place column: the city line and the zone line. */
  place: string;
  /** The city line: as tall as the time button on a phone, so the zone line stands level with the date. */
  cityLine: string;
  /** The local time and date column. */
  dateTime: string;
  /** Whether the date comes before the time button in the reading order. */
  isDateBeforeTime: boolean;
  /** Whether the row shows the day track under or beside its header. */
  hasDayTrack: boolean;
  /** Whether an open location menu is placed from its button, clear of the panel's overflow. */
  isMenuFixedToViewport: boolean;
};

const HEADER_LINE_CLASS_NAMES = "flex flex-wrap items-center gap-x-3 gap-y-2";
const STICKY_BOX_CLASS_NAMES =
  "sticky left-[var(--grid-row-padding)] z-[2] w-[calc(var(--grid-panel-width)-2*var(--grid-row-padding))]";

/**
 * The classes that differ between the variants, in one place so the shared
 * row components look them up instead of branching. The Grid design:
 * `docs/architecture/views.md` → Grid → Row header.
 * Implements FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4).
 * Implements FR1, FR7, FR10, NFR-R2, NFR-R3, UX3 of add-grid-hour-cells-and-hour-frame (D5):
 * the grid panel scrolls its strips while the sticky boxes keep the header and
 * the notes in place and above the hour frame.
 * Implements FR9 of add-grid-meeting-range-and-share (D6): an open location menu stays above the meeting handles.
 */
export const LOCATION_ROW_VARIANT_CLASS_NAMES: Record<
  LocationRowVariant,
  LocationRowVariantClassNames
> = {
  [LocationRowVariant.CARD]: {
    list: "flex flex-col gap-2",
    row: `${HEADER_LINE_CLASS_NAMES} px-4 rounded-md border border-border`,
    placeAndTime: "md:flex-none",
    place: "md:w-64 md:flex-none",
    cityLine: "",
    dateTime: "flex-col md:items-start md:w-44",
    isDateBeforeTime: false,
    hasDayTrack: true,
    isMenuFixedToViewport: false,
  },
  [LocationRowVariant.GRID_ROW]: {
    list: "relative overflow-x-auto overscroll-x-contain rounded-md border border-border",
    row: "flex flex-col gap-y-2 px-[var(--grid-row-padding)] min-w-full w-max border-t border-border first:border-t-0 first:rounded-t-md last:rounded-b-md",
    headerBox: `${HEADER_LINE_CLASS_NAMES} ${STICKY_BOX_CLASS_NAMES} focus-within:z-[4]`,
    notesBox: `${STICKY_BOX_CLASS_NAMES} order-last`,
    placeAndTime: "md:flex-1",
    place: "md:flex-1 md:flex-row md:items-baseline md:gap-x-2",
    cityLine: "min-h-11 md:min-h-0",
    dateTime: "flex-col-reverse md:flex-row md:items-baseline md:gap-x-3",
    isDateBeforeTime: true,
    hasDayTrack: false,
    isMenuFixedToViewport: true,
  },
};
