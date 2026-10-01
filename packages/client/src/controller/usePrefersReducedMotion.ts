import { useSyncExternalStore } from "react";
import { REDUCED_MOTION_MEDIA_QUERY } from "@/constants";

const CHANGE_EVENT = "change";

const readQueryList = () =>
  typeof window.matchMedia === "function"
    ? window.matchMedia(REDUCED_MOTION_MEDIA_QUERY)
    : undefined;

function subscribe(onChange: () => void) {
  const queryList = readQueryList();
  queryList?.addEventListener(CHANGE_EVENT, onChange);
  return () => queryList?.removeEventListener(CHANGE_EVENT, onChange);
}

const getSnapshot = () => readQueryList()?.matches ?? false;

/**
 * Whether the user asks the system to reduce motion.
 * Implements NFR-A4 of reorder-locations-by-drag-and-drop (D3).
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot);
}
