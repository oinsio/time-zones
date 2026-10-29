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
import { LOCATION_MENU_TRIGGER_GLYPH, OutsidePressEvent } from "@/constants";
import { IS_POINTER_EVENTS_SUPPORTED } from "@/lib/legacy";
import { getMenuKeyAction, MenuKeyAction } from "./locationMenuKeys";

export type LocationMenuItem = {
  label: string;
  onSelect: () => void;
};

type LocationMenuProps = {
  city: string;
  items: readonly LocationMenuItem[];
};

// `pointerdown` does not exist before iOS Safari 13; there a press is a touch or a mouse event.
const OUTSIDE_PRESS_EVENTS = IS_POINTER_EVENTS_SUPPORTED
  ? [OutsidePressEvent.POINTER_DOWN]
  : [OutsidePressEvent.TOUCH_START, OutsidePressEvent.MOUSE_DOWN];

/**
 * The "⋯" menu of a location card, a WAI-ARIA menu button driven by `click`, so
 * it works on engines without Pointer Events. Escape returns focus to the
 * button; a press outside, or focus moving outside, closes it.
 * Implements FR11, FR14, NFR-A2, UX3 of set-home-location-and-show-differences (D7).
 */
export const LocationMenu = forwardRef<HTMLButtonElement, LocationMenuProps>(
  function LocationMenu({ city, items }, forwardedTriggerRef) {
    const { t } = useTranslation();
    const menuId = useId();
    const rootRef = useRef<HTMLSpanElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(0);

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
    const lastIndex = items.length - 1;

    const handleTriggerKeyDown = (event: KeyboardEvent) => {
      const action = getMenuKeyAction(event.key);
      if (action === MenuKeyAction.NEXT) openAt(0);
      else if (action === MenuKeyAction.PREVIOUS) openAt(lastIndex);
      else return;
      event.preventDefault();
    };

    const handleMenuKeyDown = (event: KeyboardEvent) => {
      switch (getMenuKeyAction(event.key)) {
        case MenuKeyAction.NEXT:
          setFocusedIndex((focusedIndex + 1) % items.length);
          break;
        case MenuKeyAction.PREVIOUS:
          setFocusedIndex((focusedIndex + lastIndex) % items.length);
          break;
        case MenuKeyAction.FIRST:
          setFocusedIndex(0);
          break;
        case MenuKeyAction.LAST:
          setFocusedIndex(lastIndex);
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
      // biome-ignore lint/a11y/noStaticElementInteractions: keys and focus are handled for the menu button pattern inside
      <span
        ref={rootRef}
        className="relative inline-flex"
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
          onClick={() => (isOpen ? setIsOpen(false) : openAt(0))}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-xl font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span aria-hidden="true">{LOCATION_MENU_TRIGGER_GLYPH}</span>
        </button>
        {isOpen && (
          <div
            id={menuId}
            role="menu"
            tabIndex={-1}
            aria-label={t("locations.locationMenu", { city })}
            className="absolute right-0 top-full z-20 mt-1 flex w-max max-w-full min-w-44 flex-col rounded-md border border-border bg-surface py-1 shadow-lg"
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
                onClick={() => {
                  closeAndFocusTrigger();
                  item.onSelect();
                }}
                className="min-h-11 px-4 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
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
