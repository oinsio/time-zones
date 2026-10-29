/** Duration of the slide of cards that make room for a dragged card. */
export const REORDER_TRANSITION_DURATION_MS = 200;

export const REORDER_TRANSITION_EASING = "ease";

/** Pointer travel before a press on the handle becomes a drag. */
export const REORDER_POINTER_ACTIVATION_DISTANCE_PX = 4;

/** Fewer locations than this have no order to change. */
export const MIN_LOCATIONS_TO_REORDER = 2;

export const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Hold before a finger press on the handle becomes a drag, so a swipe that
 * starts scrolling still scrolls the page.
 * Implements FR9 of support-legacy-ios-12-safari.
 */
export const REORDER_TOUCH_ACTIVATION_DELAY_MS = 250;

/** Finger travel allowed during the hold before the drag is cancelled. */
export const REORDER_TOUCH_ACTIVATION_TOLERANCE_PX = 5;
