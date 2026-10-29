/** Id of the element in index.html that the React app mounts into. */
export const ROOT_ELEMENT_ID = "root";

/**
 * Document events that mean "the user pressed somewhere": `pointerdown` where
 * Pointer Events exist, `touchstart` and `mousedown` on engines without them.
 * Implements FR14 of set-home-location-and-show-differences (D7).
 */
export enum OutsidePressEvent {
  POINTER_DOWN = "pointerdown",
  TOUCH_START = "touchstart",
  MOUSE_DOWN = "mousedown",
}
