import { type CSSProperties, type RefObject, useEffect, useState } from "react";
import { LOCATION_MENU_OFFSET_PX } from "@/constants";

const SCROLL_EVENT = "scroll";
const RESIZE_EVENT = "resize";

/**
 * The place of an open location menu that is `position: fixed`: under its
 * button and right-aligned to it, re-read while the page, the grid panel or
 * the window scrolls or resizes. `undefined` while closed or when the menu
 * is not fixed, so the menu keeps its own `absolute` place.
 * Implements FR1 of add-grid-hour-cells-and-hour-frame (D5): the menu is not clipped by the panel's overflow.
 */
export function useFixedMenuPosition(
  triggerRef: RefObject<HTMLElement | null>,
  isActive: boolean,
): CSSProperties | undefined {
  const [position, setPosition] = useState<CSSProperties | undefined>();
  useEffect(() => {
    if (!isActive) {
      setPosition(undefined);
      return;
    }
    const readPosition = () => {
      const triggerBox = triggerRef.current?.getBoundingClientRect();
      if (triggerBox === undefined) return;
      setPosition({
        position: "fixed",
        top: triggerBox.bottom + LOCATION_MENU_OFFSET_PX,
        right: document.documentElement.clientWidth - triggerBox.right,
      });
    };
    readPosition();
    window.addEventListener(SCROLL_EVENT, readPosition, true);
    window.addEventListener(RESIZE_EVENT, readPosition);
    return () => {
      window.removeEventListener(SCROLL_EVENT, readPosition, true);
      window.removeEventListener(RESIZE_EVENT, readPosition);
    };
  }, [isActive, triggerRef]);
  return position;
}
