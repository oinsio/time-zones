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

/**
 * Id of the Add location button; the cards view focuses it by id after the
 * last removal (D11 of add-settings-page-and-device-time-location).
 */
export const ADD_LOCATION_BUTTON_ID = "add-location-button";
