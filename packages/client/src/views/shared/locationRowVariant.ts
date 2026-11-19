import {
  GRID_MARK_ICON_SIZE_PX,
  LOCATION_MARK_ICON_SIZE_PX,
} from "@/constants";

/**
 * How a view shows one location row: a card of its own, or a row of the grid panel.
 * Implements FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4).
 * Implements FR6, FR7 of fix-grid-meeting-range-lock-and-layering (D5).
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
  /** The layer of the header box at rest; with the box only. */
  headerBoxLayer?: string;
  /** The layer of the header box while its location menu is open; with the box only. */
  headerBoxLayerWithOpenMenu?: string;
  /** The box around the row notes; none where the notes need none. */
  notesBox?: string;
  /** The row header: below 768 px two lines, from 768 px one line of flex items. */
  header: string;
  /** Line 1 below 768 px: the place and the time group; its children join the header from 768 px. */
  lineOne: string;
  /** The grab area: mark, city and offset difference; it may wrap, never narrower than its longest word. */
  place: string;
  /** The city. */
  city: string;
  /** The offset difference after the city. */
  difference: string;
  /** Line 2 below 768 px: the zone line and the date; its children join the header from 768 px. */
  lineTwo: string;
  /** The zone line element, also part of the grab area. */
  zoneLine: string;
  /** The local date. */
  date: string;
  /** The time and the location menu button; it moves to its own line at the right when the place needs the room. */
  timeGroup: string;
  /** The time button. */
  time: string;
  /** Side of the mark icon, in px. */
  markSizePx: number;
  /** Whether the row shows the day track under its header. */
  hasDayTrack: boolean;
  /** Whether an open location menu is placed from its button, clear of the panel's overflow. */
  isMenuFixedToViewport: boolean;
};

const STICKY_BOX_CLASS_NAMES =
  "sticky left-[var(--grid-row-padding)] z-grid-box w-[calc(var(--grid-panel-width)-2*var(--grid-row-padding))]";
const HEADER_CLASS_NAMES =
  "flex flex-col gap-y-1 md:flex-row md:flex-wrap md:items-baseline md:gap-x-3";
const LINE_ONE_CLASS_NAMES = "flex flex-wrap items-center gap-x-3 md:contents";
const PLACE_CLASS_NAMES =
  "flex min-w-[min-content] flex-1 basis-0 flex-wrap items-baseline gap-x-2 md:order-1 md:min-w-0 md:flex-none";
const LINE_TWO_CLASS_NAMES =
  "flex items-baseline justify-between gap-x-3 md:contents";
const DATE_CLASS_NAMES =
  "shrink-0 whitespace-nowrap bg-surface text-muted-foreground ml-auto md:order-3";
const TIME_GROUP_CLASS_NAMES =
  "ml-auto flex shrink-0 items-center md:order-4 md:ml-0";

/**
 * The classes that differ between the variants, in one place so the shared
 * row components look them up instead of branching. The Grid design:
 * `docs/architecture/views.md` → Grid → Row header.
 * Implements FR7, UX3 of add-view-mode-setting-and-grid-skeleton (D4).
 * Implements FR1, FR7, FR10, NFR-R2, NFR-R3, UX3 of add-grid-hour-cells-and-hour-frame (D5):
 * the grid panel scrolls its strips while the sticky boxes keep the header and
 * the notes in place and above the hour frame.
 * Implements FR9 of add-grid-meeting-range-and-share (D6): an open location menu stays above the meeting handles.
 * Implements FR7, FR8, FR10, FR11, FR17 of redesign-cards-grid-and-day-palettes (D5): the two
 * layouts, narrow and wide, with the sizes of spec.md sections 5, 6 and 10.
 */
export const LOCATION_ROW_VARIANT_CLASS_NAMES: Record<
  LocationRowVariant,
  LocationRowVariantClassNames
> = {
  [LocationRowVariant.CARD]: {
    list: "flex flex-col gap-card-gap",
    row: "flex flex-col rounded-card border border-card-border bg-surface px-card-side-small pb-card-bottom pt-card-top min-[361px]:px-card-side min-[411px]:px-card-side-large md:px-card-wide-x md:py-card-wide-y",
    header: HEADER_CLASS_NAMES,
    lineOne: LINE_ONE_CLASS_NAMES,
    place: PLACE_CLASS_NAMES,
    city: "break-words bg-surface text-card-city-small font-bold min-[361px]:text-card-city min-[411px]:text-card-city-large",
    difference:
      "bg-surface text-card-difference font-semibold text-muted-foreground",
    lineTwo: LINE_TWO_CLASS_NAMES,
    zoneLine:
      "min-w-0 flex-1 text-card-meta-small text-muted-foreground min-[361px]:text-card-meta min-[411px]:text-card-meta-large md:order-2 md:flex-none",
    date: `${DATE_CLASS_NAMES} text-card-meta-small min-[361px]:text-card-meta min-[411px]:text-card-meta-large`,
    timeGroup: TIME_GROUP_CLASS_NAMES,
    time: "text-card-time-small min-[361px]:text-card-time min-[411px]:text-card-time-large",
    markSizePx: LOCATION_MARK_ICON_SIZE_PX,
    hasDayTrack: true,
    isMenuFixedToViewport: false,
  },
  [LocationRowVariant.GRID_ROW]: {
    list: "relative overflow-x-auto overscroll-x-contain rounded-card border border-card-border",
    row: "flex flex-col gap-y-2 bg-surface px-[var(--grid-row-padding)] py-3 min-w-full w-max border-t border-card-border first:border-t-0 first:rounded-t-card last:rounded-b-card",
    headerBox: STICKY_BOX_CLASS_NAMES,
    headerBoxLayer: "focus-within:z-grid-box-focused",
    headerBoxLayerWithOpenMenu: "z-location-menu",
    notesBox: `${STICKY_BOX_CLASS_NAMES} order-last`,
    header: HEADER_CLASS_NAMES,
    lineOne: LINE_ONE_CLASS_NAMES,
    place: PLACE_CLASS_NAMES,
    city: "break-words bg-surface text-grid-city font-bold md:text-grid-city-wide",
    difference:
      "bg-surface text-card-difference font-semibold text-muted-foreground",
    lineTwo: LINE_TWO_CLASS_NAMES,
    zoneLine:
      "min-w-0 flex-1 text-grid-meta text-muted-foreground md:order-2 md:flex-none",
    date: `${DATE_CLASS_NAMES} text-grid-meta`,
    timeGroup: TIME_GROUP_CLASS_NAMES,
    time: "text-grid-time md:text-grid-time-wide",
    markSizePx: GRID_MARK_ICON_SIZE_PX,
    hasDayTrack: false,
    isMenuFixedToViewport: true,
  },
};
