const VISIBILITY_CHANGE_EVENT = "visibilitychange";

/**
 * Sets `document.visibilityState` and fires `visibilitychange`.
 * Implements FR3 of show-local-time-and-date-on-location-cards (D6).
 */
export function setPageVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
  document.dispatchEvent(new Event(VISIBILITY_CHANGE_EVENT));
}

/** Restores the jsdom default (`visible`) without firing an event. */
export function resetPageVisibility() {
  Reflect.deleteProperty(document, "visibilityState");
}
