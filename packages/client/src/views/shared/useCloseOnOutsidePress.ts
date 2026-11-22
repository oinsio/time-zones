import { type RefObject, useEffect, useRef } from "react";
import { OutsidePressEvent } from "@/constants";
import { IS_POINTER_EVENTS_SUPPORTED } from "@/lib/legacy";

// `pointerdown` does not exist before iOS Safari 13; there a press is a touch or a mouse event.
const OUTSIDE_PRESS_EVENTS = IS_POINTER_EVENTS_SUPPORTED
  ? [OutsidePressEvent.POINTER_DOWN]
  : [OutsidePressEvent.TOUCH_START, OutsidePressEvent.MOUSE_DOWN];

/**
 * Calls `onOutsidePress` for a press outside `rootRef` while `isOpen`.
 * Implements FR11 of set-home-location-and-show-differences (D7): a press outside closes the location menu.
 */
export function useCloseOnOutsidePress(
  isOpen: boolean,
  rootRef: RefObject<HTMLElement | null>,
  onOutsidePress: () => void,
): void {
  const onOutsidePressRef = useRef(onOutsidePress);
  onOutsidePressRef.current = onOutsidePress;
  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsidePress = (event: Event) => {
      if (!rootRef.current?.contains(event.target as Node)) onOutsidePressRef.current();
    };
    for (const eventType of OUTSIDE_PRESS_EVENTS) {
      document.addEventListener(eventType, closeOnOutsidePress);
    }
    return () => {
      for (const eventType of OUTSIDE_PRESS_EVENTS) {
        document.removeEventListener(eventType, closeOnOutsidePress);
      }
    };
  }, [isOpen, rootRef]);
}
