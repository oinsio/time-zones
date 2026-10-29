import {
  createLucideIcon,
  type IconNode,
  type LucideIcon,
  Navigation,
} from "lucide-react";
import { LOCATION_MARK_ICON_SIZE_PX } from "@/constants";
import { LocationMarkKind, type PresentedLocationMark } from "@/presenter";

const FILLED_ICON_FILL = "currentColor";
/**
 * Outline kinds pass "none" explicitly: undefined would drop lucide's default
 * fill and the browser would paint the glyph black.
 */
const OUTLINE_ICON_FILL = "none";

/** The house path drawn by docs/design/screens/phone-light.html. */
const HOME_MARK_HOUSE_ICON_NODE: IconNode = [
  ["path", { d: "M4 11l8-7 8 7v9H4z", key: "home-mark-house" }],
];
const HomeMarkHouse = createLucideIcon(
  "home-mark-house",
  HOME_MARK_HOUSE_ICON_NODE,
);

type LocationMarkIconDefinition = {
  Icon: LucideIcon;
  /** Filled glyph (arrow) or outline glyph (house). */
  isFilled: boolean;
};

/**
 * Icon of every mark kind; the exhaustive record makes a new kind fail to
 * compile until it has an icon.
 * Implements FR4, UX1 of match-here-mark-to-design (D3).
 * Implements FR7 of set-home-location-and-show-differences (D3): the house.
 * Implements FR1, FR2, FR3, FR4 of match-home-mark-to-design.
 */
export const LOCATION_MARK_ICONS: Record<
  LocationMarkKind,
  LocationMarkIconDefinition
> = {
  [LocationMarkKind.HERE]: { Icon: Navigation, isFilled: true },
  [LocationMarkKind.HOME]: { Icon: HomeMarkHouse, isFilled: false },
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
