import { EllipsisVertical } from "lucide-react";
import {
  type FocusEvent,
  forwardRef,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { LOCATION_MENU_ICON_SIZE_PX, OutsidePressEvent } from "@/constants";
import { IS_POINTER_EVENTS_SUPPORTED } from "@/lib/legacy";
import { getMenuKeyAction, MenuKeyAction } from "./locationMenuKeys";
import {
  getEnabledMenuIndex,
  MenuStepDirection,
} from "./locationMenuNavigation";
import { useFixedMenuPosition } from "./useFixedMenuPosition";

export type LocationMenuItem = {
  label: string;
  onSelect: () => void;
  /** A disabled item stays in the menu, is skipped by the arrow keys and does nothing when activated. */
  isDisabled?: boolean;
};

type LocationMenuProps = {
  city: string;
  items: readonly LocationMenuItem[];
  /** Places the open menu from its button instead of inside its row; `false` when omitted. */
  isMenuFixedToViewport?: boolean;
  /** Locks the button and closes an open menu; `false` when omitted. */
  isDisabled?: boolean;
  /** Called whenever the menu opens or closes. */
  onOpenChange?: (isOpen: boolean) => void;
};

// `pointerdown` does not exist before iOS Safari 13; there a press is a touch or a mouse event.
const OUTSIDE_PRESS_EVENTS = IS_POINTER_EVENTS_SUPPORTED
  ? [OutsidePressEvent.POINTER_DOWN]
  : [OutsidePressEvent.TOUCH_START, OutsidePressEvent.MOUSE_DOWN];

/**
 * The vertical-dots menu of a location card, a WAI-ARIA menu button driven by `click`, so
 * it works on engines without Pointer Events. Escape returns focus to the
 * button; a press outside, or focus moving outside, closes it.
 * Implements FR11, FR14, NFR-A2, UX3 of set-home-location-and-show-differences (D7).
 * Implements FR1 of add-grid-hour-cells-and-hour-frame (D5): `isMenuFixedToViewport`.
 * Implements FR1, UX1 of fix-grid-meeting-range-lock-and-layering (D1): `isDisabled`.
 * Implements FR6, FR7 of fix-grid-meeting-range-lock-and-layering (D5): `onOpenChange`.
 * Implements FR16, NFR-A3 of redesign-cards-grid-and-day-palettes (D6): disabled items.
 * Implements FR1, FR2, FR3, NFR-A1, UX2 of make-location-menu-button-vertical (D1, D2).
 */
export const LocationMenu = forwardRef<HTMLButtonElement, LocationMenuProps>(
  function LocationMenu(
    {
      city,
      items,
      isMenuFixedToViewport = false,
      isDisabled = false,
      onOpenChange,
    },
    forwardedTriggerRef,
  ) {
    const { t } = useTranslation();
    const menuId = useId();
    const rootRef = useRef<HTMLSpanElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const fixedPosition = useFixedMenuPosition(
      triggerRef,
      isOpen && isMenuFixedToViewport,
    );

    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    useEffect(() => {
      onOpenChangeRef.current?.(isOpen);
    }, [isOpen]);

    useEffect(() => {
      if (isDisabled) setIsOpen(false);
    }, [isDisabled]);

    useEffect(() => {
      if (isOpen) itemRefs.current[focusedIndex]?.focus();
    }, [isOpen, focusedIndex]);

    useEffect(() => {
      if (!isOpen) return;
      const closeOnOutsidePress = (event: Event) => {
        if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
      };
      for (const eventType of OUTSIDE_PRESS_EVENTS) {
        document.addEventListener(eventType, closeOnOutsidePress);
      }
      return () => {
        for (const eventType of OUTSIDE_PRESS_EVENTS) {
          document.removeEventListener(eventType, closeOnOutsidePress);
        }
      };
    }, [isOpen]);

    const openAt = (index: number) => {
      setFocusedIndex(index);
      setIsOpen(true);
    };
    const closeAndFocusTrigger = () => {
      setIsOpen(false);
      triggerRef.current?.focus();
    };
    const disabledFlags = items.map((item) => item.isDisabled === true);
    const firstEnabledIndex = getEnabledMenuIndex(
      disabledFlags,
      -1,
      MenuStepDirection.NEXT,
    );
    const lastEnabledIndex = getEnabledMenuIndex(
      disabledFlags,
      items.length,
      MenuStepDirection.PREVIOUS,
    );

    const handleTriggerKeyDown = (event: KeyboardEvent) => {
      const action = getMenuKeyAction(event.key);
      if (action === MenuKeyAction.NEXT) openAt(firstEnabledIndex);
      else if (action === MenuKeyAction.PREVIOUS) openAt(lastEnabledIndex);
      else return;
      event.preventDefault();
    };

    const handleMenuKeyDown = (event: KeyboardEvent) => {
      switch (getMenuKeyAction(event.key)) {
        case MenuKeyAction.NEXT:
          setFocusedIndex(
            getEnabledMenuIndex(
              disabledFlags,
              focusedIndex,
              MenuStepDirection.NEXT,
            ),
          );
          break;
        case MenuKeyAction.PREVIOUS:
          setFocusedIndex(
            getEnabledMenuIndex(
              disabledFlags,
              focusedIndex,
              MenuStepDirection.PREVIOUS,
            ),
          );
          break;
        case MenuKeyAction.FIRST:
          setFocusedIndex(firstEnabledIndex);
          break;
        case MenuKeyAction.LAST:
          setFocusedIndex(lastEnabledIndex);
          break;
        case MenuKeyAction.CLOSE:
          closeAndFocusTrigger();
          break;
        case MenuKeyAction.LEAVE:
          setIsOpen(false);
          return;
        default:
          return;
      }
      event.preventDefault();
    };

    // WebKit blurs the focused item before the click of a tap (relatedTarget is null): ignore that.
    const handleBlur = (event: FocusEvent) => {
      const nextFocus = event.relatedTarget;
      if (
        nextFocus instanceof Element &&
        !rootRef.current?.contains(nextFocus)
      ) {
        setIsOpen(false);
      }
    };

    return (
      <span
        ref={rootRef}
        className="relative -mr-3 inline-flex"
        onKeyDown={isOpen ? handleMenuKeyDown : handleTriggerKeyDown}
        onBlur={handleBlur}
      >
        <button
          ref={(element) => {
            triggerRef.current = element;
            if (typeof forwardedTriggerRef === "function") {
              forwardedTriggerRef(element);
            } else if (forwardedTriggerRef) {
              forwardedTriggerRef.current = element;
            }
          }}
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls={isOpen ? menuId : undefined}
          aria-label={t("locations.locationMenu", { city })}
          disabled={isDisabled}
          onClick={() =>
            isOpen ? setIsOpen(false) : openAt(firstEnabledIndex)
          }
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md disabled:cursor-default disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <EllipsisVertical
            aria-hidden="true"
            size={LOCATION_MENU_ICON_SIZE_PX}
          />
        </button>
        {isOpen && (
          <div
            id={menuId}
            role="menu"
            tabIndex={-1}
            aria-label={t("locations.locationMenu", { city })}
            style={fixedPosition}
            className={`${isMenuFixedToViewport ? "fixed" : "absolute right-0 top-full mt-1"} z-location-menu flex w-max max-w-full min-w-44 flex-col rounded-md border border-control-border bg-surface py-1 shadow-lg`}
          >
            {items.map((item, index) => (
              <button
                key={item.label}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                aria-disabled={item.isDisabled ? "true" : undefined}
                onClick={() => {
                  if (item.isDisabled) return;
                  closeAndFocusTrigger();
                  item.onSelect();
                }}
                className={`min-h-11 px-4 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent${item.isDisabled ? " cursor-default opacity-40" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </span>
    );
  },
);
