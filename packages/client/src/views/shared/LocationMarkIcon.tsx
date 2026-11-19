import { House, type LucideIcon, MapPin } from "lucide-react";
import { LOCATION_MARK_ICON_SIZE_PX } from "@/constants";
import { LocationMarkKind, type PresentedLocationMark } from "@/presenter";

const FILLED_ICON_FILL = "currentColor";
/**
 * Outline kinds pass "none" explicitly: undefined would drop lucide's default
 * fill and the browser would paint the glyph black.
 */
const OUTLINE_ICON_FILL = "none";

type LocationMarkIconDefinition = {
  Icon: LucideIcon;
  /** Filled glyph or outline glyph; both marks are outline glyphs. */
  isFilled: boolean;
};

/**
 * Icon of every mark kind; the exhaustive record makes a new kind fail to
 * compile until it has an icon.
 * Implements FR4, UX1 of match-here-mark-to-design (D3).
 * Implements FR7 of set-home-location-and-show-differences (D3): the house.
 * Implements FR1, FR2, FR3, FR4 of match-home-mark-to-design.
 * Implements FR10 of redesign-cards-grid-and-day-palettes (D7): Lucide `MapPin` and `House`, both outline.
 */
export const LOCATION_MARK_ICONS: Record<
  LocationMarkKind,
  LocationMarkIconDefinition
> = {
  [LocationMarkKind.HERE]: { Icon: MapPin, isFilled: false },
  [LocationMarkKind.HOME]: { Icon: House, isFilled: false },
};

type LocationMarkIconProps = {
  mark: PresentedLocationMark;
  id: string;
};

/**
 * The leading mark of a location row, named for assistive technology by the
 * wrapper so the name does not depend on how the icon library treats ARIA.
 * Implements FR1, FR4, UX1 of match-here-mark-to-design (D3).
 * Implements FR1, FR2, FR3, FR4 of match-home-mark-to-design.
 */
export function LocationMarkIcon({ mark, id }: LocationMarkIconProps) {
  const { Icon, isFilled } = LOCATION_MARK_ICONS[mark.kind];
  return (
    <span
      id={id}
      role="img"
      aria-label={mark.accessibleLabel}
      className="inline-flex shrink-0 text-accent"
    >
      <Icon
        aria-hidden="true"
        size={LOCATION_MARK_ICON_SIZE_PX}
        fill={isFilled ? FILLED_ICON_FILL : OUTLINE_ICON_FILL}
      />
    </span>
  );
}
