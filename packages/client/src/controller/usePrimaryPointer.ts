import { useSyncExternalStore } from "react";
import { PRIMARY_POINTER_FINE_HOVER_MEDIA_QUERY } from "@/constants";

const CHANGE_EVENT = "change";

const readQueryList = () =>
  typeof window.matchMedia === "function"
    ? window.matchMedia(PRIMARY_POINTER_FINE_HOVER_MEDIA_QUERY)
    : undefined;

function subscribe(onChange: () => void) {
  const queryList = readQueryList();
  if (queryList === undefined) return () => {};
  if (typeof queryList.addEventListener !== "function") {
    queryList.addListener(onChange);
    return () => queryList.removeListener(onChange);
  }
  queryList.addEventListener(CHANGE_EVENT, onChange);
  return () => queryList.removeEventListener(CHANGE_EVENT, onChange);
}

const getSnapshot = () => readQueryList()?.matches ?? false;

/**
 * Whether the primary pointer is fine and can hover (a mouse): a page then
 * focuses its main field on opening; on a touch device a keyboard would cover
 * the rows. A browser with no `matchMedia` counts as touch.
 * Implements NFR-A2 of add-unix-time-converter-tool (D12).
 */
export function usePrimaryPointer(): { isFineAndHovering: boolean } {
  return { isFineAndHovering: useSyncExternalStore(subscribe, getSnapshot) };
}
