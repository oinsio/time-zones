import { KeyboardKey } from "@/constants";

const CONTENT_EDITABLE_SELECTOR =
  '[contenteditable]:not([contenteditable="false"])';
const TEXTAREA_SELECTOR = "textarea";
const INPUT_TAG_NAME = "input";
const NON_TEXT_INPUT_TYPES: ReadonlySet<string> = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (
    target.closest(TEXTAREA_SELECTOR) ||
    target.closest(CONTENT_EDITABLE_SELECTOR)
  ) {
    return true;
  }
  return (
    target.localName === INPUT_TAG_NAME &&
    !NON_TEXT_INPUT_TYPES.has((target as HTMLInputElement).type)
  );
}

/**
 * Whether a keydown is the "open the location search" shortcut: the "/"
 * character without Ctrl, Meta or Alt, outside text-entry elements.
 * Implements FR1, FR2, FR4 of open-location-search-with-slash-shortcut (D2).
 */
export function isSearchShortcutEvent(event: KeyboardEvent): boolean {
  return (
    event.key === KeyboardKey.SLASH &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !isTextEntryTarget(event.target)
  );
}
