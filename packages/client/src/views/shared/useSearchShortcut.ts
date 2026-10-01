import { useEffect } from "react";
import { isSearchShortcutEvent } from "./searchShortcut";

const KEYDOWN_EVENT = "keydown";

type UseSearchShortcutOptions = {
  isEnabled: boolean;
  onShortcut: () => void;
};

/**
 * Calls `onShortcut` when the search shortcut is pressed anywhere on the page,
 * and keeps the key press from reaching the browser. Inactive while disabled.
 * Implements FR1, FR2, FR3, FR4, UX1 of open-location-search-with-slash-shortcut
 * (D3).
 */
export function useSearchShortcut({
  isEnabled,
  onShortcut,
}: UseSearchShortcutOptions): void {
  useEffect(() => {
    if (!isEnabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isSearchShortcutEvent(event)) return;
      event.preventDefault();
      onShortcut();
    };
    document.addEventListener(KEYDOWN_EVENT, handleKeyDown);
    return () => document.removeEventListener(KEYDOWN_EVENT, handleKeyDown);
  }, [isEnabled, onShortcut]);
}
